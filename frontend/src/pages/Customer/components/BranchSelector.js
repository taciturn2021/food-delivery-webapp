import React from 'react';
import { MapPin, Clock } from 'lucide-react';
import MapLocationPicker from '../../../components/common/MapLocationPicker';
import { 
  Select, 
  SelectContent, 
  SelectItem, 
  SelectTrigger, 
  SelectValue 
} from '../../../components/ui/select';
import { Card, CardContent } from '../../../components/ui/card';
import { Badge } from '../../../components/ui/badge';
import { useNavigate } from 'react-router-dom';

const BranchSelector = ({ branches = [], onBranchSelect, isDialog = false, currentBranchId }) => {
    const navigate = useNavigate();
    const handleChange = (value) => {
        const branchId = parseInt(value);
        if (branchId) {
            const branch = branches.find(b => b.id === branchId);
            if (branch) {
                onBranchSelect(branchId);
            }
        }
    };

    const selectedBranchData = branches.find(b => b.id === currentBranchId);

    if (!branches || branches.length === 0) {
        return (
            <div className="p-6 flex justify-center items-center">
                <div className="animate-spin mr-3 h-5 w-5 border-2 border-blue-600 border-t-transparent rounded-full"></div>
                <p>Loading branches...</p>
            </div>
        );
    }

    return (
        <div className="p-4 sm:p-6">
            <div className="mb-4 sm:mb-6">
                <Select onValueChange={handleChange} value={currentBranchId ? currentBranchId.toString() : undefined}>
                    <SelectTrigger className="w-full">
                        <SelectValue placeholder="Select a Branch" />
                    </SelectTrigger>
                    <SelectContent>
                        {branches.map((branch) => (
                            <SelectItem key={branch.id} value={branch.id.toString()}>
                                {branch.name} - {branch.address}
                            </SelectItem>
                        ))}
                    </SelectContent>
                </Select>
            </div>

            {selectedBranchData && (
                <Card className="mt-4 overflow-hidden">
                    <CardContent className="p-0">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 sm:gap-6">
                            <div className="p-4 sm:p-6">
                                <h3 className="text-lg font-semibold mb-3 sm:mb-4">Branch Details</h3>
                                <div className="space-y-3">
                                    <div className="flex items-start text-slate-700">
                                        <MapPin className="mr-2 h-4 w-4 mt-1 flex-shrink-0" />
                                        <span className="text-sm sm:text-base">{selectedBranchData.address}</span>
                                    </div>
                                    <div className="flex items-center text-slate-700">
                                        <Clock className="mr-2 h-4 w-4 flex-shrink-0" />
                                        <span className="text-sm sm:text-base">
                                            {`${selectedBranchData.opening_time ? selectedBranchData.opening_time.slice(0, 5) : 'N/A'} - ${selectedBranchData.closing_time ? selectedBranchData.closing_time.slice(0, 5) : 'N/A'}`}
                                        </span>
                                    </div>
                                </div>
                                <div className="flex flex-wrap gap-2 mt-3 sm:mt-4">
                                    <Badge variant="outline" className="px-2 sm:px-3 py-1 text-xs sm:text-sm">
                                        Minimum Order: ${selectedBranchData.minimum_order_amount}
                                    </Badge>
                                    <Badge variant="outline" className="px-2 sm:px-3 py-1 text-xs sm:text-sm">
                                        Delivery Radius: {selectedBranchData.delivery_radius}km
                                    </Badge>
                                </div>
                            </div>
                            <div className="h-48 sm:h-64 md:h-auto w-full">
                                <MapLocationPicker
                                    location={{ 
                                        lat: parseFloat(selectedBranchData.latitude), 
                                        lng: parseFloat(selectedBranchData.longitude) 
                                    }}
                                    onLocationChange={() => {}}
                                    readOnly={true}
                                    deliveryRadius={selectedBranchData.delivery_radius}
                                />
                            </div>
                        </div>
                    </CardContent>
                </Card>
            )}
        </div>
    );
};

export default BranchSelector;