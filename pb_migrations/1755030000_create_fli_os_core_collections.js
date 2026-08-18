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

	const createCollection = (name, type = 'base') =>
		new Collection({
			name,
			type,
			system: false,
			listRule: null,
			viewRule: null,
			createRule: null,
			updateRule: null,
			deleteRule: null,
			indexes: [],
			fields: [],
			options: {}
		});

	const makeTypedField = (fieldConfig) => {
		const baseConfig = {
			name: fieldConfig.name,
			required: fieldConfig.required ?? false,
			presentable: fieldConfig.presentable ?? false,
			unique: fieldConfig.unique ?? false,
			options: fieldConfig.options ?? {}
		};

		switch (fieldConfig.type) {
			case 'text':
				return new TextField(baseConfig);
			case 'relation':
				return new RelationField({
					...baseConfig,
					collectionId: fieldConfig.options.collectionId,
					cascadeDelete: fieldConfig.options.cascadeDelete ?? false,
					minSelect: fieldConfig.options.minSelect ?? null,
					maxSelect: fieldConfig.options.maxSelect ?? 1,
					displayFields: fieldConfig.options.displayFields ?? []
				});
			case 'select':
				return new SelectField({
					...baseConfig,
					maxSelect: fieldConfig.options.maxSelect ?? 1,
					values: fieldConfig.options.values ?? []
				});
			case 'number':
				return new NumberField({
					...baseConfig,
					min: fieldConfig.options.min ?? null,
					max: fieldConfig.options.max ?? null,
					noDecimal: fieldConfig.options.noDecimal ?? false
				});
			case 'date':
				return new DateField({
					...baseConfig,
					min: fieldConfig.options.min ?? '',
					max: fieldConfig.options.max ?? ''
				});
			case 'json':
				return new JSONField(baseConfig);
			default:
				return new TextField(baseConfig);
		}
	};

	const ensureField = (collection, fieldConfig) => {
		const existing = collection.fields.getByName(fieldConfig.name);
		if (existing) {
			existing.required = fieldConfig.required ?? existing.required ?? false;
			existing.presentable = fieldConfig.presentable ?? existing.presentable ?? false;
			existing.unique = fieldConfig.unique ?? existing.unique ?? false;
			if (fieldConfig.options) {
				existing.options = fieldConfig.options;
			}
			if (fieldConfig.type === 'relation' && fieldConfig.options) {
				existing.collectionId = fieldConfig.options.collectionId;
				existing.cascadeDelete = fieldConfig.options.cascadeDelete ?? false;
				existing.minSelect = fieldConfig.options.minSelect ?? null;
				existing.maxSelect = fieldConfig.options.maxSelect ?? 1;
				existing.displayFields = fieldConfig.options.displayFields ?? [];
			}
			return existing;
		}

		const nextField = makeTypedField(fieldConfig);
		collection.fields.add(nextField);
		return nextField;
	};

	const ensureCollection = (config) => {
		let collection = findCollectionByNameOrIdSafe(config.name);
		if (!collection) {
			collection = createCollection(config.name, config.type);
		}

		if (!collection.indexes) {
			collection.indexes = [];
		}
		collection.indexes = Array.from(new Set([...(collection.indexes || []), ...(config.indexes ?? [])]));
		collection.options = config.options ?? collection.options ?? {};

		for (const fieldConfig of config.fields) {
			ensureField(collection, fieldConfig);
		}

		console.log(
			'DEBUG_ENSURE_COLLECTION',
			JSON.stringify({
				configName: config.name,
				nextId: collection.id,
				nextName: collection.name,
				nextType: collection.type,
				fieldCount: collection.fields.length,
				indexesCount: collection.indexes.length
			})
		);
		app.save(collection);
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
		fields: [
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
		fields: [
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
		fields: [
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

	let usersCollection = authUsers ?? createCollection('users', 'auth');
	if (!usersCollection.indexes) {
		usersCollection.indexes = [];
	}

	const ensureUserField = (fieldConfig) => {
		const existing = usersCollection.fields.getByName(fieldConfig.name);
		if (existing) {
			existing.required = fieldConfig.required ?? existing.required ?? false;
			existing.presentable = fieldConfig.presentable ?? existing.presentable ?? false;
			existing.unique = fieldConfig.unique ?? existing.unique ?? false;
			if (fieldConfig.options) {
				existing.options = fieldConfig.options;
			}
			if (fieldConfig.type === 'relation' && fieldConfig.options) {
				existing.collectionId = fieldConfig.options.collectionId;
				existing.cascadeDelete = fieldConfig.options.cascadeDelete ?? false;
				existing.minSelect = fieldConfig.options.minSelect ?? null;
				existing.maxSelect = fieldConfig.options.maxSelect ?? 1;
				existing.displayFields = fieldConfig.options.displayFields ?? [];
			}
			return existing;
		}

		const nextField = makeTypedField(fieldConfig);
		usersCollection.fields.add(nextField);
		return nextField;
	};

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

	for (const field of userFields) {
		ensureUserField(field);
	}

	console.log(
		'DEBUG_NEXT_USER_COLLECTION',
		JSON.stringify({
			id: usersCollection.id,
			name: usersCollection.name,
			type: usersCollection.type,
			system: usersCollection.system,
			fieldCount: usersCollection.fields.length,
			indexesCount: usersCollection.indexes.length
		})
	);
	app.save(usersCollection);

	const projects = ensureCollection({
		name: 'projects',
		type: 'base',
		indexes: [],
		options: {},
		fields: [
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
		fields: [
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
					collectionId: (authUsers ?? usersCollection).id,
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

	const organizationField = users.fields.getByName('organization');
	if (!organizationField) return;

	organizationField.required = true;
	app.save(users);
});
