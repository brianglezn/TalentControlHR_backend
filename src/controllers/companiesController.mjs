import { ObjectId } from 'mongodb';
import { client, DB_NAME } from '../config/database.mjs';

const COMPANIES_COLLECTION = 'companies';

export const getAllCompanies = async (req, res) => {
    try {
        const db = client.db(DB_NAME);
        const companies = await db.collection(COMPANIES_COLLECTION).find().toArray();
        res.status(200).json(companies);
    } catch (error) {
        res.status(500).json({ error: 'Error retrieving companies', details: error.message });
    }
};

export const getCompanyById = async (req, res) => {
    const { id } = req.params;
    try {
        const db = client.db(DB_NAME);
        const company = await db.collection(COMPANIES_COLLECTION).findOne({ _id: new ObjectId(id) });
        if (!company) {
            return res.status(404).json({ error: 'Company not found' });
        }
        res.status(200).json(company);
    } catch (error) {
        res.status(500).json({ error: 'Error retrieving company', details: error.message });
    }
};

export const createCompany = async (req, res) => {
    const { name, description, industry, image } = req.body;

    try {
        const db = client.db(DB_NAME);

        const existingCompany = await db.collection(COMPANIES_COLLECTION).findOne({ name: name.trim() });
        if (existingCompany) {
            return res.json({ 
                error: true, 
                message: 'A company with this name already exists. Please choose a different name.' 
            });
        }

        const newCompany = {
            name: name.trim(),
            description: description?.trim(),
            industry,
            image,
            teams: [],
            users: []
        };

        const result = await db.collection(COMPANIES_COLLECTION).insertOne(newCompany);

        if (!result.insertedId) {
            throw new Error('Unexpected error occurred while creating the company.');
        }

        res.json({
            error: false,
            message: 'Company created successfully.',
            company: {
                _id: result.insertedId.toString(),
                ...newCompany,
            },
        });
    } catch (error) {
        console.error('Error creating company:', error.message);
        res.json({ 
            error: true, 
            message: 'An error occurred while creating the company. Please try again.' 
        });
    }
};

export const updateCompanyById = async (req, res) => {
    const { id } = req.params;
    const updateData = req.body;
    try {
        const db = client.db(DB_NAME);
        const result = await db.collection(COMPANIES_COLLECTION).updateOne({ _id: new ObjectId(id) }, { $set: updateData });
        if (result.matchedCount === 0) {
            return res.status(404).json({ error: 'Company not found' });
        }
        res.status(200).json({ message: 'Company updated successfully' });
    } catch (error) {
        res.status(500).json({ error: 'Error updating company', details: error.message });
    }
};

export const deleteCompanyById = async (req, res) => {
    const { id } = req.params;
    try {
        const db = client.db(DB_NAME);
        const result = await db.collection(COMPANIES_COLLECTION).deleteOne({ _id: new ObjectId(id) });
        if (result.deletedCount === 0) {
            return res.status(404).json({ error: 'Company not found' });
        }
        res.status(200).json({ message: 'Company deleted successfully' });
    } catch (error) {
        res.status(500).json({ error: 'Error deleting company', details: error.message });
    }
};

export const getCompanyTeams = async (req, res) => {
    const { id } = req.params;
    try {
        const db = client.db(DB_NAME);
        const company = await db.collection(COMPANIES_COLLECTION).findOne({ _id: new ObjectId(id) }, { projection: { teams: 1 } });
        if (!company) {
            return res.status(404).json({ error: 'Company not found' });
        }
        res.status(200).json(company.teams);
    } catch (error) {
        res.status(500).json({ error: 'Error retrieving company teams', details: error.message });
    }
};

export const addTeamToCompany = async (req, res) => {
    const { id } = req.params;
    const { name, description, color } = req.body;

    const newTeam = {
        teamId: new ObjectId(),
        name,
        description: description || '',
        color: color || '#6b7280',
        users: []
    };

    try {
        const db = client.db(DB_NAME);

        const result = await db.collection(COMPANIES_COLLECTION).updateOne(
            { _id: new ObjectId(id) },
            { $push: { teams: newTeam } }
        );

        if (result.matchedCount === 0) {
            return res.status(404).json({ error: 'Company not found' });
        }

        res.status(200).json({ message: 'Team added successfully', team: newTeam });
    } catch (error) {
        res.status(500).json({ error: 'Error adding team to company', details: error.message });
    }
};

export const updateTeamFromCompany = async (req, res) => {
    const { id, teamId } = req.params;
    const { name, description, color } = req.body;

    try {
        const db = client.db(DB_NAME);

        const result = await db.collection(COMPANIES_COLLECTION).updateOne(
            { _id: new ObjectId(id), 'teams.teamId': new ObjectId(teamId) },
            {
                $set: {
                    'teams.$.name': name || 'Unnamed Team',
                    'teams.$.description': description || '',
                    'teams.$.color': color || '#000000',
                },
            }
        );

        if (result.matchedCount === 0) {
            return res.status(404).json({ error: 'Company or team not found' });
        }

        res.status(200).json({ message: 'Team updated successfully' });
    } catch (error) {
        res.status(500).json({ error: 'Error updating team', details: error.message });
    }
};

export const deleteTeamFromCompany = async (req, res) => {
    const { id, teamId } = req.params;

    try {
        const db = client.db(DB_NAME);

        const result = await db.collection(COMPANIES_COLLECTION).updateOne(
            { _id: new ObjectId(id) },
            { $pull: { teams: { teamId: new ObjectId(teamId) } } }
        );

        if (result.matchedCount === 0) {
            return res.status(404).json({ error: 'Company or team not found' });
        }

        res.status(200).json({ message: 'Team removed successfully' });
    } catch (error) {
        res.status(500).json({ error: 'Error removing team from company', details: error.message });
    }
};

export const getCompanyTeamsById = async (req, res) => {
    const { id, teamId } = req.params;
    try {
        const db = client.db(DB_NAME);

        const company = await db.collection(COMPANIES_COLLECTION).findOne(
            { _id: new ObjectId(id), 'teams.teamId': teamId },
            { projection: { 'teams.$': 1 } }
        );

        if (!company || !company.teams || company.teams.length === 0) {
            return res.status(404).json({ error: `Team with ID ${teamId} not found in the specified company with ID ${id}` });
        }

        res.status(200).json(company.teams[0]);
    } catch (error) {
        res.status(500).json({ error: 'Error retrieving team from company', details: error.message });
    }
};

export const getUsersFromTeam = async (req, res) => {
    const { id, teamId } = req.params;

    try {
        const db = client.db(DB_NAME);

        const company = await db.collection(COMPANIES_COLLECTION).findOne(
            { _id: new ObjectId(id), 'teams.teamId': teamId },
            { projection: { 'teams.$': 1 } }
        );

        if (!company || !company.teams || company.teams.length === 0) {
            return res.status(404).json({ error: `Team with ID ${teamId} not found in the company with ID ${id}` });
        }

        const team = company.teams[0];
        const userIds = team.users || [];

        if (userIds.length === 0) {
            return res.status(404).json({ message: 'No users found in the team' });
        }

        const users = await db.collection('users').find({ _id: { $in: userIds.map(id => new ObjectId(id)) } }).toArray();

        res.status(200).json(users);
    } catch (error) {
        res.status(500).json({ error: 'Error retrieving users from team', details: error.message });
    }
};

export const addUserToTeam = async (req, res) => {
    const { id: companyId, teamId, userId } = req.params;

    try {
        const db = client.db(DB_NAME);

        const company = await db.collection(COMPANIES_COLLECTION).findOne({ _id: new ObjectId(companyId) });
        if (!company) {
            return res.status(404).json({ error: `Company with ID ${companyId} not found.` });
        }

        const team = company.teams.find((team) => team.teamId.equals(new ObjectId(teamId)));
        if (!team) {
            return res.status(404).json({ error: `Team with ID ${teamId} not found in company.` });
        }

        if (!Array.isArray(team.users)) {
            team.users = [];
        }

        if (team.users.includes(userId)) {
            return res.status(400).json({ error: `User with ID ${userId} already in the team.` });
        }

        const result = await db.collection(COMPANIES_COLLECTION).updateOne(
            { _id: new ObjectId(companyId), 'teams.teamId': new ObjectId(teamId) },
            { $push: { 'teams.$.users': userId } }
        );

        if (result.modifiedCount === 0) {
            return res.status(404).json({ error: `Failed to add user to team.` });
        }

        res.status(200).json({ message: 'User successfully added to team.' });
    } catch (error) {
        console.error('Error adding user to team:', error);
        res.status(500).json({ error: 'Error adding user to team.', details: error.message });
    }
};

export const deleteUserFromTeam = async (req, res) => {
    const { id, teamId, userId } = req.params;

    try {
        const db = client.db(DB_NAME);

        const result = await db.collection(COMPANIES_COLLECTION).updateOne(
            { _id: new ObjectId(id), 'teams.teamId': new ObjectId(teamId) },
            { $pull: { 'teams.$.users': userId } }
        );

        if (result.matchedCount === 0) {
            return res.status(404).json({ error: `User with ID ${userId} not found in the team with ID ${teamId}` });
        }

        res.status(200).json({ message: 'User successfully removed from the team' });
    } catch (error) {
        res.status(500).json({ error: 'Error removing user from team', details: error.message });
    }
};

export const getUsersFromCompany = async (req, res) => {
    const { id } = req.params;

    try {
        const db = client.db(DB_NAME);

        const company = await db.collection(COMPANIES_COLLECTION).findOne(
            { _id: new ObjectId(id) },
            { projection: { users: 1 } }
        );

        if (!company || !company.users) {
            return res.status(404).json({ error: `Company with ID ${id} not found or no users exist in this company.` });
        }

        const userIds = company.users.map((user) => new ObjectId(user.userId));

        const users = await db.collection('users').find({ _id: { $in: userIds } }).toArray();

        const enrichedUsers = users.map((user) => {
            const companyUser = company.users.find((cu) => cu.userId === user._id.toString());
            return {
                ...user,
                roles: companyUser ? companyUser.roles : [],
            };
        });

        res.status(200).json(enrichedUsers);
    } catch (error) {
        console.error('Error retrieving users from company:', error);
        res.status(500).json({ error: 'Error retrieving users from company', details: error.message });
    }
};

export const addUserToCompany = async (req, res) => {
    const { id: companyId, userId } = req.params; 
    const { roles } = req.body; 

    try {
        const db = client.db(DB_NAME);

        const company = await db.collection(COMPANIES_COLLECTION).findOne({ _id: new ObjectId(companyId) });
        if (!company) {
            return res.json({ 
                error: true, 
                message: `Company with ID ${companyId} not found.` 
            });
        }

        const userAlreadyExists = company.users.some((u) => u.userId === userId);
        if (userAlreadyExists) {
            return res.json({ 
                error: true, 
                message: `User with ID ${userId} is already part of the company.` 
            });
        }

        const result = await db.collection(COMPANIES_COLLECTION).updateOne(
            { _id: new ObjectId(companyId) },
            { $push: { users: { userId, roles: roles || ['employee'] } } }
        );

        if (result.modifiedCount === 0) {
            return res.json({ 
                error: true, 
                message: 'Failed to add the user to the company. Please try again.' 
            });
        }

        res.json({ 
            error: false, 
            message: 'User added to company successfully.' 
        });
    } catch (error) {
        console.error('Error adding user to company:', error.message);
        res.json({ 
            error: true, 
            message: 'An unexpected error occurred while adding the user to the company.' 
        });
    }
};

export const updateUserRolesInCompany = async (req, res) => {
    const { id: companyId, userId } = req.params;
    const { roles } = req.body;

    try {
        const db = client.db(DB_NAME);
        const result = await db.collection(COMPANIES_COLLECTION).updateOne(
            { _id: new ObjectId(companyId), 'users.userId': userId },
            { $set: { 'users.$.roles': roles } }
        );

        if (result.matchedCount === 0) {
            return res.status(404).json({ error: 'User not found in the company' });
        }

        res.status(200).json({ message: 'User roles updated successfully' });
    } catch (error) {
        console.error('Error updating user roles in company:', error);
        res.status(500).json({ error: 'Failed to update user roles' });
    }
};

export const deleteUserFromCompany = async (req, res) => {
    const { id: companyId, userId } = req.params;

    try {
        const db = client.db(DB_NAME);

        const result = await db.collection(COMPANIES_COLLECTION).updateOne(
            { _id: new ObjectId(companyId) },
            { $pull: { users: { userId } } }
        );

        if (result.matchedCount === 0) {
            return res.status(404).json({ error: `User with ID ${userId} not found in the company` });
        }

        res.status(200).json({ message: 'User successfully removed from the company' });
    } catch (error) {
        console.error('Error removing user from company:', error);
        res.status(500).json({ error: 'Failed to remove user from company' });
    }
};