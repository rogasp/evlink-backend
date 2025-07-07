import { Skeleton } from "@/components/ui/skeleton";
import type { Vehicle } from "@/types/vehicle";
import clsx from "clsx";

type Props = {
  vehicles: Vehicle[];
  loading: boolean;
  onUnlinkVendor: (vendor: string) => void;
  onDetailsClick: (vehicle: Vehicle) => void;
  onCopyIdClick: (vehicle: Vehicle) => void;
};

export default function VehicleList({
  vehicles,
  loading,
  onUnlinkVendor,
  onDetailsClick,
  onCopyIdClick,
}: Props) {
  if (loading) {
    return (
      <>
        {/* Desktop skeleton */}
        <div className="hidden md:block">
          <div className="rounded-xl border bg-white overflow-x-auto">
            <table className="min-w-full">
              <thead>
                <tr className="bg-gray-100">
                  <th className="px-6 py-3 text-left font-bold text-gray-800">Vehicle</th>
                  <th className="px-6 py-3 text-left font-bold text-gray-800">Battery</th>
                  <th className="px-6 py-3 text-left font-bold text-gray-800">Range</th>
                  <th className="px-6 py-3 text-left font-bold text-gray-800">Status</th>
                  <th className="px-6 py-3 text-left font-bold text-gray-800">Actions</th>
                </tr>
              </thead>
              <tbody>
                {[...Array(2)].map((_, i) => (
                  <tr key={i} className="border-b">
                    <td className="px-6 py-4">
                      <Skeleton className="h-6 w-52 bg-indigo-100" />
                      <Skeleton className="h-4 w-40 mt-1 bg-indigo-100" />
                    </td>
                    <td className="px-6 py-4">
                      <Skeleton className="h-6 w-12 bg-indigo-100" />
                    </td>
                    <td className="px-6 py-4">
                      <Skeleton className="h-6 w-12 bg-indigo-100" />
                    </td>
                    <td className="px-6 py-4">
                      <Skeleton className="h-6 w-16 bg-indigo-100" />
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-col gap-2">
                        <Skeleton className="h-9 w-20 bg-indigo-100" />
                        <Skeleton className="h-9 w-20 bg-indigo-100" />
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        {/* Mobil skeleton */}
        <div className="md:hidden flex flex-col gap-4">
          {[...Array(2)].map((_, i) => (
            <div key={i} className="rounded-xl border bg-white p-4">
              <Skeleton className="h-7 w-2/3 mb-2 bg-indigo-100" />
              <Skeleton className="h-4 w-1/2 mb-1 bg-indigo-100" />
              <Skeleton className="h-4 w-1/3 mb-4 bg-indigo-100" />
              <div className="flex flex-row gap-2">
                <Skeleton className="h-9 flex-1 bg-indigo-100" />
                <Skeleton className="h-9 flex-1 bg-indigo-100" />
                <Skeleton className="h-9 flex-1 bg-indigo-100" />
              </div>
            </div>
          ))}
        </div>
      </>
    );
  }

  if (!vehicles || vehicles.length === 0) {
    return (
      <div className="p-4 text-gray-500 text-center">
        No vehicles linked yet.
      </div>
    );
  }

  // Desktop/tablet
  return (
    <>
      <div className="hidden md:block">
        <div className="rounded-xl border bg-white overflow-x-auto">
          <table className="min-w-full">
            <thead>
              <tr className="bg-gray-100">
                <th className="px-6 py-3 text-left font-bold text-gray-800">Vehicle</th>
                <th className="px-6 py-3 text-left font-bold text-gray-800">Battery</th>
                <th className="px-6 py-3 text-left font-bold text-gray-800">Range</th>
                <th className="px-6 py-3 text-left font-bold text-gray-800">Status</th>
                <th className="px-6 py-3 text-left font-bold text-gray-800">Actions</th>
              </tr>
            </thead>
            <tbody>
              {vehicles.map((vehicle) => {
                const displayName =
                  vehicle.information?.displayName ||
                  [vehicle.information?.brand, vehicle.information?.model]
                    .filter(Boolean)
                    .join(" ") ||
                  vehicle.id;

                const battery =
                  vehicle.chargeState?.batteryLevel != null
                    ? `${vehicle.chargeState.batteryLevel}%`
                    : "-";
                const range =
                  vehicle.chargeState?.range != null
                    ? `${vehicle.chargeState.range} km`
                    : "-";
                const status =
                  vehicle.isReachable === true
                    ? "Online"
                    : vehicle.isReachable === false
                    ? "Offline"
                    : "-";

                return (
                  <tr key={vehicle.id} className="border-b">
                    <td className="px-6 py-4">
                      <div className="font-semibold text-gray-900">{displayName}</div>
                      <div className="text-xs text-gray-400">
                        Vehicle id: {vehicle.id}
                      </div>
                    </td>
                    <td className="px-6 py-4">{battery}</td>
                    <td className="px-6 py-4">{range}</td>
                    <td className="px-6 py-4">
                      <span
                        className={clsx(
                          status === "Online" && "text-green-600 font-medium",
                          status === "Offline" && "text-red-500 font-medium"
                        )}
                      >
                        {status}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-row gap-2 w-full">
                        <button
                          className="flex-1 px-4 py-2 rounded-lg border border-gray-300 bg-white text-gray-900 font-semibold hover:bg-gray-50 transition"
                          onClick={() => onDetailsClick(vehicle)}
                        >
                          Details
                        </button>
                        <button
                          className="flex-1 px-4 py-2 rounded-lg bg-red-600 text-white font-semibold hover:bg-red-700 transition"
                          onClick={() => onUnlinkVendor(vehicle.vendor)}
                        >
                          Unlink
                        </button>
                        <button
                          className="flex-1 px-4 py-2 rounded-lg border border-gray-300 bg-white text-gray-900 font-semibold hover:bg-gray-50 transition"
                          onClick={() => onCopyIdClick(vehicle)}
                        >
                          Copy ID
                        </button>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </div>
      {/* Mobil/kort, actions bredvid varandra */}
      <div className="md:hidden flex flex-col gap-4">
        {vehicles.map((vehicle) => {
          const displayName =
            vehicle.information?.displayName ||
            [vehicle.information?.brand, vehicle.information?.model]
              .filter(Boolean)
              .join(" ") ||
            vehicle.id;

          const battery =
            vehicle.chargeState?.batteryLevel != null
              ? `${vehicle.chargeState.batteryLevel}%`
              : "-";
          const range =
            vehicle.chargeState?.range != null
              ? `${vehicle.chargeState.range} km`
              : "-";
          const status =
            vehicle.isReachable === true
              ? "Online"
              : vehicle.isReachable === false
              ? "Offline"
              : "-";

          return (
            <div
              key={vehicle.id}
              className="rounded-xl border bg-white p-4 flex flex-col gap-2 shadow-sm"
            >
              <div className="font-semibold text-lg text-gray-900">{displayName}</div>
              <div className="text-xs text-gray-400 mb-1">Vehicle id: {vehicle.id}</div>
              <div className="text-sm text-gray-600 mb-1">
                Battery: <span className="font-medium">{battery}</span>
                {" · "}
                Range: <span className="font-medium">{range}</span>
              </div>
              <div className="text-sm mb-2">
                Status:{" "}
                <span
                  className={clsx(
                    status === "Online" && "text-green-600 font-medium",
                    status === "Offline" && "text-red-500 font-medium"
                  )}
                >
                  {status}
                </span>
              </div>
              <div className="flex flex-row gap-2 mt-2">
                <button
                  className="flex-1 px-4 py-2 rounded-lg border border-gray-300 bg-white text-gray-900 font-semibold hover:bg-gray-50 transition"
                  onClick={() => onDetailsClick(vehicle)}
                >
                  Details
                </button>
                <button
                  className="flex-1 px-4 py-2 rounded-lg bg-red-600 text-white font-semibold hover:bg-red-700 transition"
                  onClick={() => onUnlinkVendor(vehicle.vendor)}
                >
                  Unlink
                </button>
                <button
                  className="flex-1 px-4 py-2 rounded-lg border border-gray-300 bg-white text-gray-900 font-semibold hover:bg-gray-50 transition"
                  onClick={() => onCopyIdClick(vehicle)}
                >
                  Copy ID
                </button>
              </div>
            </div>
          );
        })}
      </div>
    </>
  );
}
