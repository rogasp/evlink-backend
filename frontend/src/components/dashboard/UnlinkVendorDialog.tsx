import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Vehicle } from '@/types/vehicle';

interface UnlinkVendorDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  vendor: string;
  vehicles: Vehicle[];
  onConfirm: () => void;
}

export default function UnlinkVendorDialog({
  open,
  onOpenChange,
  vendor,
  vehicles,
  onConfirm,
}: UnlinkVendorDialogProps) {
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Unlink vendor: {vendor}</DialogTitle>
          <DialogDescription>
            This will remove your connection to <strong>{vendor}</strong> and delete the following vehicles:
          </DialogDescription>
        </DialogHeader>

        <ul className="pl-5 list-disc space-y-1">
            {vehicles.map((v) => {
                const info = v.information;

                if (!info) return null;

                return (
                <li key={v.id}>
                    {info.brand} {info.model} ({info.vin})
                </li>
                );
            })}
        </ul>


        <DialogFooter className="pt-4">
          <DialogClose asChild>
            <Button variant="secondary">Cancel</Button>
          </DialogClose>
          <Button variant="destructive" onClick={onConfirm}>
            Yes, unlink vendor
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
