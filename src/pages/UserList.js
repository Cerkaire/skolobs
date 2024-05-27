import React from 'react';
import Card from '@mui/material/Card';

export default function UserList({ users }) {
    return (
        <Card sx={{ height: "100%", width: "100%" }}>
            <ul>
                {users.map(user => (
                    <li key={user.id}>{user.email}</li>
                ))}
            </ul>
        </Card>
    );
}
