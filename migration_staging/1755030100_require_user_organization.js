migrate(
	(app) => {
		const usersCollection = app.findCollectionByNameOrId('users');

		if (!usersCollection) {
			throw new Error('users collection not found');
		}

		const organizationField = (usersCollection.schema || []).find(
			(field) => field.name === 'organization'
		);

		if (!organizationField) {
			throw new Error('users.organization field not found');
		}

		const missingUsers = app.findRecordsByFilter('users', 'organization = ""');

		if (missingUsers.length > 0) {
			const examples = missingUsers
				.slice(0, 5)
				.map((record) => record.id)
				.join(', ');

			throw new Error(
				`Cannot require users.organization: ${missingUsers.length} user(s) have no organization. Examples: ${examples}`
			);
		}

		organizationField.required = true;
		app.save(usersCollection);
	},
	(app) => {
		const usersCollection = app.findCollectionByNameOrId('users');

		if (!usersCollection) {
			return;
		}

		const organizationField = (usersCollection.schema || []).find(
			(field) => field.name === 'organization'
		);

		if (!organizationField) {
			return;
		}

		organizationField.required = false;
		app.save(usersCollection);
	}
);
