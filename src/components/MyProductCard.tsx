import React from 'react';

interface MyProductCardProps {
  name: string;
  image: string;
  price: number;
  cycleDays: number;
  income: number;
  createDate: string;
  status: 'pending' | 'active' | 'completed';
  onGet: () => void;
}

const MyProductCard: React.FC<MyProductCardProps> = ({
  name,
  image,
  price,
  cycleDays,
  income,
  createDate,
  status,
  onGet,
}) => {
  const getButtonStyle = () => {
    switch (status) {
      case 'pending':
        return 'bg-muted text-muted-foreground';
      case 'active':
        return 'bg-green-100 text-green-600 hover:bg-green-200';
      case 'completed':
        return 'bg-muted text-muted-foreground';
      default:
        return 'bg-muted text-muted-foreground';
    }
  };

  return (
    <div className="bg-card rounded-xl border border-border p-4 mb-3">
      <div className="flex gap-3">
        {/* Product image */}
        <div className="w-16 h-16 flex-shrink-0 rounded-lg overflow-hidden bg-muted flex items-center justify-center">
          <img 
            src={image} 
            alt={name} 
            className="w-full h-full object-contain"
          />
        </div>

        {/* Product details */}
        <div className="flex-1">
          <h3 className="font-display text-base font-bold text-foreground mb-2">{name}</h3>
          
          <div className="grid grid-cols-2 gap-x-4 gap-y-0.5 text-sm">
            <span className="text-muted-foreground">Price</span>
            <span className="text-primary font-semibold text-right">{price.toLocaleString()} ETB</span>
            
            <span className="text-muted-foreground">Cycle</span>
            <span className="text-primary font-semibold text-right">{cycleDays} Days</span>
            
            <span className="text-muted-foreground">Income</span>
            <span className="text-green-600 font-semibold text-right">{income.toLocaleString()} ETB</span>
            
            <span className="text-muted-foreground">Create</span>
            <span className="text-primary font-semibold text-right">{createDate}</span>
          </div>
        </div>
      </div>

      {/* Get button */}
      <button
        onClick={onGet}
        disabled={status !== 'active'}
        className={`w-full mt-3 py-2 font-semibold rounded-lg transition-colors ${getButtonStyle()}`}
      >
        get
      </button>
    </div>
  );
};

export default MyProductCard;
