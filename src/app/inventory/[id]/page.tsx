import { notFound } from 'next/navigation';
import { getItemById } from '@/lib/data';
import { AdEnhancer } from '@/components/inventory/ad-enhancer';
import { ItemDetails } from '@/components/inventory/item-details';

export default function ItemDetailPage({ params }: { params: { id: string } }) {
  const item = getItemById(params.id);

  if (!item) {
    notFound();
  }

  return (
    <div className="grid gap-8 lg:grid-cols-3">
        <div className="lg:col-span-1">
            <ItemDetails item={item} />
        </div>
        <div className="lg:col-span-2">
            <AdEnhancer item={item} />
        </div>
    </div>
  );
}
