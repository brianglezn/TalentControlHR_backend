import mongoose from 'mongoose';

const UserSchema = new mongoose.Schema(
    {
        userId: { type: String, required: true, unique: true },
        username: { type: String, required: true, unique: true },
        name: { type: String, required: true },
        surnames: { type: String, required: true },
        email: { type: String, required: true, unique: true },
        password: { type: String, required: true },
        role: { type: String, required: true },
        company: { type: mongoose.Schema.Types.ObjectId, ref: 'Company', required: false },
        team: { type: mongoose.Schema.Types.ObjectId, ref: 'CompanyTeam', required: false },
    },
    { timestamps: true }
);

const User = mongoose.model('User', UserSchema);
export default User;
