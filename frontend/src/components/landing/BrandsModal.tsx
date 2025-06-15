'use client';

import { useState } from 'react';
import Image from 'next/image';
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

const testedBrands = ['XPENG', 'NIO'];
const allBrands = [
  'Audi', 'BMW', 'Cupra', 'DS', 'Hyundai', 'Jaguar',
  'Kia', 'Land Rover', 'Lexus', 'Mercedes-Benz', 'Mini',
  'Nissan', 'Polestar', 'Porsche', 'Renault', 'Rivian',
  'SEAT', 'Skoda', 'Tesla', 'Toyota', 'Volkswagen',
  'Volvo'
];
const otherBrands = allBrands.filter(b => !testedBrands.includes(b));

// Lista av de sluggar som du redan har uploadade under public/brands
const availableLogoSlugs = new Set([
  'audi',
  'bmw',
  'ds',
  'hyundai',
  'jaguar',
  'kia',
  'land-rover',
  'lexus',
  'mercedes-benz',
  'mini',
  'nissan',
  'nio',
  'polestar',
  'porsche',
  'renault',
  'rivian',
  'seat',
  'skoda',
  'tesla',
  'toyota',
  'volkswagen',
  'volvo',
  'xpeng',
]);

/**
 * Gör om ett brand-namn till fil-slugg, t.ex.
 * "Land Rover" → "land-rover"
 */
function slugify(name: string) {
  return name
    .toLowerCase()
    .replace(/\s+/g, '-')        // mellanslag → en-dash för mappnamn
    .replace(/[^a-z0-9-]/g, ''); // ta bort övriga specialtecken
}

export function BrandsModal() {
  const [open, setOpen] = useState(false);

  return (
    <>
      <Button variant="link" size="sm" onClick={() => setOpen(true)}>
        See supported brands
      </Button>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="max-w-md">
          <DialogHeader>
            <DialogTitle>Supported EV Brands</DialogTitle>
            <DialogDescription>
              If you don’t see your brand here, please contact{' '}
              <a href="mailto:roger@evlinkha.se" className="underline">
                roger@evlinkha.se
              </a>.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-4 text-sm">
            {/* Tested & Verified */}
            <div>
              <strong>Tested &amp; Verified</strong>
              <ul className="list-none mt-2 space-y-1">
                {testedBrands.map(b => {
                  const slug = slugify(b);
                  const hasLogo = availableLogoSlugs.has(slug);
                  return (
                    <li key={b} className="flex items-center space-x-2">
                      {hasLogo && (
                        <div className="w-6 h-6 relative">
                          <Image
                            src={`/brands/${slug}.png`}
                            alt={`${b} logo`}
                            fill
                            style={{ objectFit: 'contain' }}
                          />
                        </div>
                      )}
                      <span>{b}</span>
                    </li>
                  );
                })}
              </ul>
            </div>

            {/* Other Supported Brands i tre kolumner med scroll */}
            <div>
              <strong>Other Supported Brands</strong>
              <div className="max-h-48 overflow-y-auto mt-2">
                <ul className="grid grid-cols-3 gap-x-4 gap-y-2 list-none">
                  {otherBrands.map(b => {
                    const slug = slugify(b);
                    const hasLogo = availableLogoSlugs.has(slug);
                    return (
                      <li key={b} className="flex items-center space-x-2">
                        {hasLogo && (
                          <div className="w-6 h-6 relative">
                            <Image
                              src={`/brands/${slug}.png`}
                              alt={`${b} logo`}
                              fill
                              style={{ objectFit: 'contain' }}
                            />
                          </div>
                        )}
                        <span className="text-sm">{b}</span>
                      </li>
                    );
                  })}
                </ul>
              </div>
            </div>
          </div>

          <DialogFooter className="pt-4">
            <DialogClose asChild>
              <Button variant="secondary">Close</Button>
            </DialogClose>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </>
  );
}
