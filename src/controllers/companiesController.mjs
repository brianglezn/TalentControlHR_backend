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
        const newCompany = { name, description, industry, image, teams: [] };
        const result = await db.collection(COMPANIES_COLLECTION).insertOne(newCompany);
        res.status(201).json({ message: 'Company created successfully', companyId: result.insertedId });
    } catch (error) {
        res.status(500).json({ error: 'Error creating company', details: error.message });
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
        color: color || '#000000',
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
    const { id, teamId, userId } = req.params;

    try {
        const db = client.db(DB_NAME);

        const company = await db.collection(COMPANIES_COLLECTION).findOne(
            { _id: new ObjectId(id), 'teams.teamId': teamId } 
        );

        if (!company) {
            return res.status(404).json({ error: `Team with ID ${teamId} not found in the specified company with ID ${id}` });
        }

        const team = company.teams.find(team => team.teamId === teamId);
        if (team.users?.includes(userId)) {
            return res.status(400).json({ error: `User with ID ${userId} already belongs to the team with ID ${teamId}` });
        }

        const result = await db.collection(COMPANIES_COLLECTION).updateOne(
            { _id: new ObjectId(id), 'teams.teamId': teamId },
            { $push: { 'teams.$.users': userId } }
        );

        if (result.matchedCount === 0) {
            return res.status(404).json({ error: `Team with ID ${teamId} not found in the specified company with ID ${id}` });
        }

        res.status(200).json({ message: 'User successfully added to the team' });
    } catch (error) {
        res.status(500).json({ error: 'Error adding user to team', details: error.message });
    }
};

export const deleteUserFromTeam = async (req, res) => {
    const { id, teamId, userId } = req.params;

    try {
        const db = client.db(DB_NAME);

        const company = await db.collection(COMPANIES_COLLECTION).findOne(
            { _id: new ObjectId(id), 'teams.teamId': teamId }
        );

        if (!company) {
            return res.status(404).json({ error: `Team with ID ${teamId} not found in the specified company with ID ${id}` });
        }

        const result = await db.collection(COMPANIES_COLLECTION).updateOne(
            { _id: new ObjectId(id), 'teams.teamId': teamId },
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

        const users = await db.collection('users').find({ _id: { $in: company.users } }).toArray();

        res.status(200).json(users);
    } catch (error) {
        res.status(500).json({ error: 'Error retrieving users from company', details: error.message });
    }
};

export const addUserToCompany = async (req, res) => {
    const { id, userId } = req.params;

    try {
        const db = client.db(DB_NAME);

        const user = await db.collection('users').findOne({ _id: new ObjectId(userId) });
        if (!user) {
            return res.status(404).json({ error: `User with ID ${userId} does not exist` });
        }

        const company = await db.collection(COMPANIES_COLLECTION).findOne({ _id: new ObjectId(id) });
        if (!company) {
            return res.status(404).json({ error: `Company with ID ${id} not found` });
        }

        if (company.users?.some(user => user.toString() === userId)) {
            return res.status(400).json({ error: `User with ID ${userId} already belongs to the company` });
        }

        const result = await db.collection(COMPANIES_COLLECTION).updateOne(
            { _id: new ObjectId(id) },
            { $push: { users: new ObjectId(userId) } }
        );

        res.status(200).json({ message: 'User successfully added to the company' });
    } catch (error) {
        res.status(500).json({ error: 'Error adding user to company', details: error.message });
    }
};

export const deleteUserFromCompany = async (req, res) => {
    const { id, userId } = req.params;

    try {
        const db = client.db(DB_NAME);

        const company = await db.collection(COMPANIES_COLLECTION).findOne(
            { _id: new ObjectId(id), users: { $in: [new ObjectId(userId)] } }
        );
        if (!company) {
            return res.status(404).json({ error: `User with ID ${userId} not found in the company with ID ${id}` });
        }

        await db.collection(COMPANIES_COLLECTION).updateOne(
            { _id: new ObjectId(id), 'teams.users': new ObjectId(userId) },
            { $pull: { 'teams.$.users': new ObjectId(userId) } }
        );

        const result = await db.collection(COMPANIES_COLLECTION).updateOne(
            { _id: new ObjectId(id) },
            { $pull: { users: new ObjectId(userId) } }
        );

        res.status(200).json({ message: 'User successfully removed from the company' });
    } catch (error) {
        res.status(500).json({ error: 'Error removing user from company', details: error.message });
    }
};

