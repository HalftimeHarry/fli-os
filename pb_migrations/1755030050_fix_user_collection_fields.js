migrate(
	(app) => {
		const usersCollection = app.findCollectionByNameOrId('users');
		if (!usersCollection) {
			throw new Error('users collection not found');
		}

		const organizationsCollection = app.findCollectionByNameOrId('organizations');
		if (!organizationsCollection) {
			throw new Error('organizations collection not found');
		}

		const currentFields = Array.isArray(usersCollection.fields)
			? [...usersCollection.fields]
			: Array.isArray(usersCollection.schema)
				? [...usersCollection.schema]
				: [];
		const fieldIndex = new Map(currentFields.map((field) => [field.name, field]));

		const ensureField = (fieldDef) => {
			const existing = fieldIndex.get(fieldDef.name);
			if (existing) {
				const merged = {
					...existing,
					...fieldDef,
					id: existing.id || fieldDef.id || fieldDef.name
				};
				const position = currentFields.findIndex((field) => field.name === fieldDef.name);
				if (position >= 0) {
					currentFields[position] = merged;
				} else {
					currentFields.push(merged);
				}
				fieldIndex.set(fieldDef.name, merged);
				return merged;
			}

			const next = { ...fieldDef, id: fieldDef.id || fieldDef.name };
			currentFields.push(next);
			fieldIndex.set(fieldDef.name, next);
			return next;
		};

		const baseOrganizationOptions = {
			collectionId: organizationsCollection.id,
			cascadeDelete: false,
			minSelect: null,
			displayFields: []
		};

		ensureField({
			id: 'firstName',
			name: 'firstName',
			type: 'text',
			required: false,
			presentable: true,
			unique: false,
			options: { min: null, max: null, pattern: '' }
		});

		ensureField({
			id: 'lastName',
			name: 'lastName',
			type: 'text',
			required: false,
			presentable: true,
			unique: false,
			options: { min: null, max: null, pattern: '' }
		});

		const organizationField = ensureField({
			id: 'organization',
			name: 'organization',
			type: 'relation',
			required: false,
			presentable: false,
			unique: false,
			options: {
				...baseOrganizationOptions,
				maxSelect: 1
			}
		});
		organizationField.required = false;
		organizationField.options = {
			...baseOrganizationOptions,
			maxSelect: 1
		};

		ensureField({
			id: 'roles',
			name: 'roles',
			type: 'relation',
			required: false,
			presentable: false,
			unique: false,
			options: {
				collectionId: app.findCollectionByNameOrId('roles')?.id,
				cascadeDelete: false,
				minSelect: null,
				maxSelect: null,
				displayFields: []
			}
		});

		ensureField({
			id: 'departments',
			name: 'departments',
			type: 'relation',
			required: false,
			presentable: false,
			unique: false,
			options: {
				collectionId: app.findCollectionByNameOrId('departments')?.id,
				cascadeDelete: false,
				minSelect: null,
				maxSelect: null,
				displayFields: []
			}
		});

		usersCollection.fields = currentFields;
		usersCollection.schema = currentFields;
		app.save(usersCollection);
	},
	(app) => {
		const usersCollection = app.findCollectionByNameOrId('users');
		if (!usersCollection) {
			return;
		}

		const fields = Array.isArray(usersCollection.fields)
			? [...usersCollection.fields]
			: Array.isArray(usersCollection.schema)
				? [...usersCollection.schema]
				: [];

		for (const field of fields) {
			if (field.name === 'organization') {
				field.required = false;
				field.options = {
					...(field.options || {}),
					collectionId: app.findCollectionByNameOrId('organizations')?.id ?? field.options?.collectionId,
					cascadeDelete: false,
					minSelect: null,
					maxSelect: 1,
					displayFields: []
				};
			}
		}

		usersCollection.fields = fields;
		usersCollection.schema = fields;
		app.save(usersCollection);
	}
);
