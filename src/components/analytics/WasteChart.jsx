import {
    PieChart, Pie, Cell, ResponsiveContainer, Tooltip, Legend
} from 'recharts';

const COLORS = ['#10b981', '#f59e0b', '#ef4444'];

export default function WasteChart({ fresh, expiring, expired }) {
    const data = [
        { name: 'Fresh', value: fresh },
        { name: 'Expiring Soon', value: expiring },
        { name: 'Expired', value: expired },
    ].filter(d => d.value > 0);

    if (data.length === 0) {
        return (
            <div className="flex items-center justify-center h-64 text-gray-400">
                No data to display
            </div>
        );
    }

    return (
        <ResponsiveContainer width="100%" height={280}>
            <PieChart>
                <Pie
                    data={data}
                    cx="50%"
                    cy="50%"
                    innerRadius={60}
                    outerRadius={90}
                    paddingAngle={5}
                    dataKey="value"
                    label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                >
                    {data.map((_, index) => (
                        <Cell key={index} fill={COLORS[index % COLORS.length]} />
                    ))}
                </Pie>
                <Tooltip
                    contentStyle={{
                        borderRadius: '12px',
                        border: 'none',
                        boxShadow: '0 4px 20px rgba(0,0,0,0.1)',
                    }}
                />
                <Legend />
            </PieChart>
        </ResponsiveContainer>
    );
}
