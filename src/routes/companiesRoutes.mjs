import express from 'express';
import {
    getAllCompanies,
    getCompanyById,
    createCompany,
    updateCompanyById,
    deleteCompanyById,
    getCompanyTeams,
    addTeamToCompany,
    updateTeamFromCompany,
    deleteUserFromCompany,
    deleteTeamFromCompany,
    getCompanyTeamsById,
    getUsersFromTeam,
    addUserToTeam,
    deleteUserFromTeam,
    getUsersFromCompany,
    addUserToCompany,
} from '../controllers/companiesController.mjs';

const router = express.Router();

router.get('/', getAllCompanies);
router.get('/:id', getCompanyById);
router.post('/', createCompany);
router.put('/:id', updateCompanyById);
router.delete('/:id', deleteCompanyById);

router.get('/:id/users', getUsersFromCompany);
router.patch('/:id/users/:userId', addUserToCompany);
router.delete('/:id/users/:userId', deleteUserFromCompany);

router.get('/:id/teams', getCompanyTeams);
router.get('/:id/teams/:teamId', getCompanyTeamsById);
router.post('/:id/teams', addTeamToCompany);
router.put('/:id/teams/:teamId', updateTeamFromCompany);
router.delete('/:id/teams/:teamId', deleteTeamFromCompany);
router.get('/:id/teams/:teamId/users', getUsersFromTeam);
router.patch('/:id/teams/:teamId/:userId', addUserToTeam);
router.delete('/:id/teams/:teamId/:userId', deleteUserFromTeam);

export default router;
