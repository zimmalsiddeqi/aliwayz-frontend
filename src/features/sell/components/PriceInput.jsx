import Input from '@components/ui/Input';

export default function PriceInput({ currency = 'USD', error, ...props }) {
  return (
    <Input
      type="number"
      label="Price"
      placeholder="0.00"
      step="0.01"
      min="0"
      leftIcon={<span className="text-xs font-mono font-bold">{currency === 'USD' ? '$' : currency}</span>}
      error={error}
      {...props}
    />
  );
}