migrate((app) => {
	const findCollectionByNameOrIdSafe = (...candidates) => {
		for (const candidate of candidates) {
			if (!candidate) continue;
			try {
				const collection = app.findCollectionByNameOrId(candidate);
				if (collection) return collection;
			} catch {
				// PocketBase can throw "sql: no rows in result set" when a collection lookup misses,
				// which is expected for a restored database that still uses the default auth collection ID.
			}
		}
		return undefined;
	};

	const findUsersCollection = () =>
		findCollectionByNameOrIdSafe('users', '_pb_users_auth_') ??
		findCollectionByNameOrIdSafe('_pb_users_auth_', 'users');

	const ensureCollection = (config) => {
		const existing = findCollectionByNameOrIdSafe(config.name);
		const next =
			existing ??
			new Collection({
				name: config.name,
				type: config.type,
				system: false,
				listRule: null,
				viewRule: null,
				createRule: null,
				updateRule: null,
				deleteRule: null,
				indexes: config.indexes ?? [],
				schema: [],
				options: config.options ?? {}
			});

		if (existing) {
			next.schema = [...(existing.schema || [])];
			next.indexes = [...(existing.indexes || [])];
		}

		const merged = new Map((next.schema || []).map((field) => [field.name, field]));

		for (const field of config.schema) {
			const existingField = merged.get(field.name);
			merged.set(
				field.name,
				existingField
					? {
							...existingField,
							...field,
							id: existingField.id || field.id
						}
					: field
			);
		}

		next.schema = Array.from(merged.values());
		next.indexes = Array.from(new Set([...(next.indexes || []), ...(config.indexes ?? [])]));
		next.options = config.options ?? next.options ?? {};
		console.log(
			'DEBUG_ENSURE_COLLECTION',
			JSON.stringify({
				configName: config.name,
				nextId: next.id,
				nextName: next.name,
				nextType: next.type,
				schemaCount: (next.schema || []).length,
				indexesCount: (next.indexes || []).length
			})
		);
		app.save(next);
		return app.findCollectionByNameOrId(config.name);
	};

	// Phase 1 intentionally keeps users.organization optional to preserve live auth records while the
	// schema and data are being brought into alignment. Existing user records must be backfilled before
	// tightening this relationship to required in a later Phase 2 migration.
	const authUsers = findUsersCollection();

	const organizations = ensureCollection({
		name: 'organizations',
		type: 'base',
		indexes: [],
		options: {},
		schema: [
			{
				id: 'name',
				name: 'name',
				type: 'text',
				required: true,
				presentable: true,
				unique: false,
				options: { min: null, max: null, pattern: '' }
			},
			{
				id: 'code',
				name: 'code',
				type: 'text',
				required: true,
				presentable: true,
				unique: false,
				options: { min: null, max: null, pattern: '' }
			}
		]
	});

	const roles = ensureCollection({
		name: 'roles',
		type: 'base',
		indexes: [],
		options: {},
		schema: [
			{
				id: 'organization',
				name: 'organization',
				type: 'relation',
				required: true,
				presentable: false,
				unique: false,
				options: {
					collectionId: organizations.id,
					cascadeDelete: false,
					minSelect: null,
					maxSelect: 1,
					displayFields: []
				}
			},
			{
				id: 'name',
				name: 'name',
				type: 'text',
				required: true,
				presentable: true,
				unique: false,
				options: { min: null, max: null, pattern: '' }
			},
			{
				id: 'permissions',
				name: 'permissions',
				type: 'json',
				required: true,
				presentable: false,
				unique: false,
				options: {}
			}
		]
	});

	const departments = ensureCollection({
		name: 'departments',
		type: 'base',
		indexes: [],
		options: {},
		schema: [
			{
				id: 'organization',
				name: 'organization',
				type: 'relation',
				required: true,
				presentable: false,
				unique: false,
				options: {
					collectionId: organizations.id,
					cascadeDelete: false,
					minSelect: null,
					maxSelect: 1,
					displayFields: []
				}
			},
			{
				id: 'name',
				name: 'name',
				type: 'text',
				required: true,
				presentable: true,
				unique: false,
				options: { min: null, max: null, pattern: '' }
			},
			{
				id: 'code',
				name: 'code',
				type: 'text',
				required: true,
				presentable: true,
				unique: false,
				options: { min: null, max: null, pattern: '' }
			},
			{
				id: 'description',
				name: 'description',
				type: 'text',
				required: false,
				presentable: false,
				unique: false,
				options: { min: null, max: null, pattern: '' }
			}
		]
	});

	const userCollection =
		authUsers ??
		new Collection({
			name: 'users',
			type: 'auth',
			system: false,
			listRule: null,
			viewRule: null,
			createRule: null,
			updateRule: null,
			deleteRule: null,
			schema: [],
			indexes: [],
			options: {}
		});

	const nextUserCollection =
		userCollection ??
		new Collection({
			name: 'users',
			type: 'auth',
			system: false,
			listRule: null,
			viewRule: null,
			createRule: null,
			updateRule: null,
			deleteRule: null,
			schema: [],
			indexes: [],
			options: {}
		});

	if (userCollection) {
		nextUserCollection.schema = [...(userCollection.schema || [])];
		nextUserCollection.indexes = [...(userCollection.indexes || [])];
	}

	const userFields = [
		{
			id: 'firstName',
			name: 'firstName',
			type: 'text',
			required: false,
			presentable: true,
			unique: false,
			options: { min: null, max: null, pattern: '' }
		},
		{
			id: 'lastName',
			name: 'lastName',
			type: 'text',
			required: false,
			presentable: true,
			unique: false,
			options: { min: null, max: null, pattern: '' }
		},
		{
			id: 'organization',
			name: 'organization',
			type: 'relation',
			required: false,
			presentable: false,
			unique: false,
			options: {
				collectionId: organizations.id,
				cascadeDelete: false,
				minSelect: null,
				maxSelect: 1,
				displayFields: []
			}
		},
		{
			id: 'roles',
			name: 'roles',
			type: 'relation',
			required: false,
			presentable: false,
			unique: false,
			options: {
				collectionId: roles.id,
				cascadeDelete: false,
				minSelect: null,
				maxSelect: null,
				displayFields: []
			}
		},
		{
			id: 'departments',
			name: 'departments',
			type: 'relation',
			required: false,
			presentable: false,
			unique: false,
			options: {
				collectionId: departments.id,
				cascadeDelete: false,
				minSelect: null,
				maxSelect: null,
				displayFields: []
			}
		}
	];

	const mergedUsers = new Map(
		(nextUserCollection.schema || []).map((field) => [field.name, field])
	);
	for (const field of userFields) {
		const existingField = mergedUsers.get(field.name);
		mergedUsers.set(
			field.name,
			existingField ? { ...existingField, ...field, id: existingField.id || field.id } : field
		);
	}

	nextUserCollection.schema = Array.from(mergedUsers.values());
	console.log(
		'DEBUG_NEXT_USER_COLLECTION',
		JSON.stringify({
			id: nextUserCollection.id,
			name: nextUserCollection.name,
			type: nextUserCollection.type,
			system: nextUserCollection.system,
			schemaCount: (nextUserCollection.schema || []).length,
			indexesCount: (nextUserCollection.indexes || []).length
		})
	);
	app.save(nextUserCollection);

	const projects = ensureCollection({
		name: 'projects',
		type: 'base',
		indexes: [],
		options: {},
		schema: [
			{
				id: 'organization',
				name: 'organization',
				type: 'relation',
				required: true,
				presentable: false,
				unique: false,
				options: {
					collectionId: organizations.id,
					cascadeDelete: false,
					minSelect: null,
					maxSelect: 1,
					displayFields: []
				}
			},
			{
				id: 'department',
				name: 'department',
				type: 'relation',
				required: true,
				presentable: false,
				unique: false,
				options: {
					collectionId: departments.id,
					cascadeDelete: false,
					minSelect: null,
					maxSelect: 1,
					displayFields: []
				}
			},
			{
				id: 'name',
				name: 'name',
				type: 'text',
				required: true,
				presentable: true,
				unique: false,
				options: { min: null, max: null, pattern: '' }
			},
			{
				id: 'code',
				name: 'code',
				type: 'text',
				required: true,
				presentable: true,
				unique: false,
				options: { min: null, max: null, pattern: '' }
			},
			{
				id: 'description',
				name: 'description',
				type: 'text',
				required: false,
				presentable: false,
				unique: false,
				options: { min: null, max: null, pattern: '' }
			},
			{
				id: 'status',
				name: 'status',
				type: 'select',
				required: true,
				presentable: true,
				unique: false,
				options: {
					maxSelect: 1,
					values: ['planned', 'active', 'on_hold', 'completed', 'cancelled']
				}
			},
			{
				id: 'budgetAmount',
				name: 'budgetAmount',
				type: 'number',
				required: false,
				presentable: false,
				unique: false,
				options: { min: null, max: null, noDecimal: false }
			},
			{
				id: 'startDate',
				name: 'startDate',
				type: 'date',
				required: false,
				presentable: false,
				unique: false,
				options: { min: '', max: '' }
			},
			{
				id: 'dueDate',
				name: 'dueDate',
				type: 'date',
				required: false,
				presentable: false,
				unique: false,
				options: { min: '', max: '' }
			}
		]
	});

	ensureCollection({
		name: 'project_tasks',
		type: 'base',
		indexes: [],
		options: {},
		schema: [
			{
				id: 'project',
				name: 'project',
				type: 'relation',
				required: true,
				presentable: false,
				unique: false,
				options: {
					collectionId: projects.id,
					cascadeDelete: false,
					minSelect: null,
					maxSelect: 1,
					displayFields: []
				}
			},
			{
				id: 'title',
				name: 'title',
				type: 'text',
				required: true,
				presentable: true,
				unique: false,
				options: { min: null, max: null, pattern: '' }
			},
			{
				id: 'description',
				name: 'description',
				type: 'text',
				required: false,
				presentable: false,
				unique: false,
				options: { min: null, max: null, pattern: '' }
			},
			{
				id: 'status',
				name: 'status',
				type: 'select',
				required: true,
				presentable: true,
				unique: false,
				options: {
					maxSelect: 1,
					values: ['todo', 'in_progress', 'blocked', 'completed', 'cancelled']
				}
			},
			{
				id: 'assignedUser',
				name: 'assignedUser',
				type: 'relation',
				required: false,
				presentable: false,
				unique: false,
				options: {
					collectionId: (authUsers ?? nextUserCollection).id,
					cascadeDelete: false,
					minSelect: null,
					maxSelect: 1,
					displayFields: []
				}
			},
			{
				id: 'financialType',
				name: 'financialType',
				type: 'select',
				required: true,
				presentable: true,
				unique: false,
				options: {
					maxSelect: 1,
					values: ['none', 'internal', 'direct_purchase', 'bid_required']
				}
			},
			{
				id: 'estimatedCost',
				name: 'estimatedCost',
				type: 'number',
				required: false,
				presentable: false,
				unique: false,
				options: { min: null, max: null, noDecimal: false }
			},
			{
				id: 'dueDate',
				name: 'dueDate',
				type: 'date',
				required: false,
				presentable: false,
				unique: false,
				options: { min: '', max: '' }
			}
		]
	});
});

migrate((app) => {
	// Phase 2 should run only after all existing users have been backfilled and verified.
	// This phase is intentionally left separate so live auth records are not forced into invalid states
	// during the first schema pass.
	const users = findUsersCollection();
	if (!users) return;

	const organizationField = users.schema.find((field) => field.name === 'organization');
	if (!organizationField) return;

	organizationField.required = true;
	app.save(users);
});
