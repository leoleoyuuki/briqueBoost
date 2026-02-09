import { StatCards } from '@/components/dashboard/stat-cards';
import { InventoryTable } from '@/components/dashboard/inventory-table';
import { getItems, calculateStats } from '@/lib/data';

export default function DashboardPage() {
    const items = getItems();
    const stats = calculateStats();

    return (
        <div className="space-y-8">
            <StatCards stats={stats} />
            <InventoryTable items={items} />
        </div>
    );
}
