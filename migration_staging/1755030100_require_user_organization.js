migrate(
	(app) => {
		// This migration must not be applied until all existing users have an organization assigned and the
		// backfill has been verified. It only tightens the existing users.organization relation from optional
		// to required; it does not create, delete, or transform any users or other collections.
		const usersCollection =
			app.findCollectionByNameOrId('_pb_users_auth_') ?? app.findCollectionByNameOrId('users');

		if (!usersCollection) {
			return;
		}

		const organizationField = (usersCollection.schema || []).find(
			(field) => field.name === 'organization'
		);

		if (!organizationField) {
			return;
		}

		const nextCollection = new Collection({
			...usersCollection,
			schema: (usersCollection.schema || []).map((field) =>
				field.name === 'organization'
					? new SchemaField({
							...field,
							required: true
						})
					: field
			)
		});

		app.save(nextCollection);
	},
	(app) => {
		const usersCollection =
			app.findCollectionByNameOrId('_pb_users_auth_') ?? app.findCollectionByNameOrId('users');

		if (!usersCollection) {
			return;
		}

		const organizationField = (usersCollection.schema || []).find(
			(field) => field.name === 'organization'
		);

		if (!organizationField) {
			return;
		}

		const nextCollection = new Collection({
			...usersCollection,
			schema: (usersCollection.schema || []).map((field) =>
				field.name === 'organization'
					? new SchemaField({
							...field,
							required: false
						})
					: field
			)
		});

		app.save(nextCollection);
	}
);
