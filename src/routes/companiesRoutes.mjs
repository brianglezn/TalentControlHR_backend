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
import { authenticateToken } from '../middlewares/authMiddleware.mjs';

const router = express.Router();

router.get('/', authenticateToken, getAllCompanies);
router.get('/:id', authenticateToken, getCompanyById);
router.post('/', authenticateToken, createCompany);
router.put('/:id', authenticateToken, updateCompanyById);
router.delete('/:id', authenticateToken, deleteCompanyById);

router.get('/:id/users', authenticateToken, getUsersFromCompany);
router.patch('/:id/users/:userId', authenticateToken, addUserToCompany);
router.delete('/:id/users/:userId', authenticateToken, deleteUserFromCompany);

router.get('/:id/teams', authenticateToken, getCompanyTeams);
router.get('/:id/teams/:teamId', authenticateToken, getCompanyTeamsById);
router.post('/:id/teams', authenticateToken, addTeamToCompany);
router.put('/:id/teams/:teamId', authenticateToken, updateTeamFromCompany);
router.delete('/:id/teams/:teamId', authenticateToken, deleteTeamFromCompany);
router.get('/:id/teams/:teamId/users', authenticateToken, getUsersFromTeam);
router.patch('/:id/teams/:teamId/:userId', authenticateToken, addUserToTeam);
router.delete('/:id/teams/:teamId/:userId', authenticateToken, deleteUserFromTeam);

export default router;
