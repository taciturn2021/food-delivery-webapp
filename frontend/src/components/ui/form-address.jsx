import { useState, useEffect } from "react"
import { MapContainer, TileLayer, Marker, useMapEvents, useMap } from "react-leaflet"
import { MapPin, Store, Loader2 } from "lucide-react"
import { Card } from "./card"
import { Input } from "./input"
import { Button } from "./button"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "./dialog"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "./select"

// A component to recenter the map when location changes
const MapCenterSetter = ({ center }) => {
  const map = useMap()
  useEffect(() => {
      if (center?.latitude && center?.longitude) {
          map.setView([center.latitude, center.longitude], 15)
      }
  }, [center, map])
  return null
}

const AddressForm = ({ address, onSubmit, onClose, branches }) => {
  const [formData, setFormData] = useState({
      street: address?.street || '',
      city: address?.city || '',
      state: address?.state || '',
      zipCode: address?.zipCode || '',
      branchId: address?.branchId || '',
      latitude: address?.latitude || null,
      longitude: address?.longitude || null
  })
  const [error, setError] = useState('')
  const [locationLoading, setLocationLoading] = useState(false)
  const [defaultCenter, setDefaultCenter] = useState({ latitude: 31.5204, longitude: 74.3587 })

  const LocationMarker = () => {
      const map = useMapEvents({
          click(e) {
              const { lat, lng } = e.latlng
              setFormData(prev => ({
                  ...prev,
                  latitude: lat,
                  longitude: lng
              }))
          }
      })

      return formData.latitude && formData.longitude ? (
          <Marker position={[formData.latitude, formData.longitude]} />
      ) : null
  }

  const getUserLocation = () => {
      setLocationLoading(true)
      if (navigator.geolocation) {
          navigator.geolocation.getCurrentPosition(
              (position) => {
                  const { latitude, longitude } = position.coords
                  setDefaultCenter({ latitude, longitude })
                  
                  if (!address) {
                      setFormData(prev => ({
                          ...prev,
                          latitude,
                          longitude
                      }))
                  }
                  setLocationLoading(false)
              },
              (error) => {
                  console.error('Error getting location:', error)
                  setLocationLoading(false)
              },
              { enableHighAccuracy: true, timeout: 5000, maximumAge: 0 }
          )
      } else {
          setError('Geolocation is not supported by this browser.')
          setLocationLoading(false)
      }
  }

  const handleSubmit = (e) => {
      e.preventDefault()
      if (!formData.latitude || !formData.longitude) {
          setError('Please select a location on the map')
          return
      }
      if (!formData.branchId) {
          setError('Please select a branch')
          return
      }
      onSubmit(formData)
  }

  return (
    <Dialog open={true} onOpenChange={onClose}>
      <DialogContent className="customer-surface max-h-[90vh] w-[min(94vw,46rem)] overflow-y-auto border border-[var(--customer-line)] bg-[var(--customer-surface)] p-5 text-[var(--customer-ink)] sm:p-7">
        <DialogHeader>
          <DialogTitle className="text-2xl font-black tracking-[-0.05em]">{address ? 'Edit address' : 'Add a delivery address'}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit}>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
              <div className="col-span-2">
                <Input
                  placeholder="Street address"
                  className="border-[var(--customer-line)] bg-[var(--customer-soft)] text-[var(--customer-ink)] focus:border-[var(--customer-coral)]"
                  value={formData.street}
                  onChange={(e) => setFormData(prev => ({ ...prev, street: e.target.value }))}
                  required
                />
              </div>
              <div>
                <Input
                  placeholder="City"
                  className="border-[var(--customer-line)] bg-[var(--customer-soft)] text-[var(--customer-ink)] focus:border-[var(--customer-coral)]"
                  value={formData.city}
                  onChange={(e) => setFormData(prev => ({ ...prev, city: e.target.value }))}
                  required
                />
              </div>
              <div>
                <Input
                  placeholder="State"
                  className="border-[var(--customer-line)] bg-[var(--customer-soft)] text-[var(--customer-ink)] focus:border-[var(--customer-coral)]"
                  value={formData.state}
                  onChange={(e) => setFormData(prev => ({ ...prev, state: e.target.value }))}
                  required
                />
              </div>
              <div>
                <Input
                  placeholder="ZIP code"
                  className="border-[var(--customer-line)] bg-[var(--customer-soft)] text-[var(--customer-ink)] focus:border-[var(--customer-coral)]"
                  value={formData.zipCode}
                  onChange={(e) => setFormData(prev => ({ ...prev, zipCode: e.target.value }))}
                  required
                />
              </div>
              <div>
                <Select 
                  value={formData.branchId?.toString() || undefined}
                  onValueChange={(value) => setFormData(prev => ({ ...prev, branchId: parseInt(value) }))}
                >
                  <SelectTrigger className="border-[var(--customer-line)] bg-[var(--customer-soft)] text-[var(--customer-ink)] focus:border-[var(--customer-coral)]">
                    <SelectValue placeholder="Select Branch" />
                  </SelectTrigger>
                  <SelectContent className="border-[var(--customer-line)] bg-[var(--customer-surface)] text-[var(--customer-ink)]">
                    {branches.map(branch => (
                      <SelectItem key={branch.id} value={branch.id.toString()}>
                        {branch.name} - {branch.address}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="flex justify-between items-center">
              <span className="text-sm font-semibold">Mark your location on the map</span>
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="border-[var(--customer-line)] bg-[var(--customer-soft)] text-[var(--customer-ink)] hover:bg-[var(--customer-soft-hover)] hover:text-[var(--customer-ink)]"
                onClick={getUserLocation}
                disabled={locationLoading}
              >
                {locationLoading ? (
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                ) : (
                  <MapPin className="mr-2 h-4 w-4" />
                )}
                Use Current Location
              </Button>
            </div>

            <div className="relative h-[300px] w-full overflow-hidden rounded-2xl border border-[var(--customer-line)]">
              {locationLoading && (
                <div className="absolute inset-0 flex items-center justify-center bg-[var(--customer-paper)]/80 z-50">
                  <Loader2 className="h-8 w-8 animate-spin text-[var(--customer-coral)]" />
                </div>
              )}
              <MapContainer
                center={[formData.latitude || defaultCenter.latitude, formData.longitude || defaultCenter.longitude]}
                zoom={15}
                style={{ height: '100%', width: '100%' }}
              >
                <TileLayer
                  url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                  attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                />
                <LocationMarker />
                <MapCenterSetter center={defaultCenter} />
              </MapContainer>
            </div>

            {error && (
              <div className="text-sm text-red-500">{error}</div>
            )}
          </div>
          <DialogFooter>
            <Button type="button" variant="outline" className="border-[var(--customer-line)] bg-[var(--customer-soft)] text-[var(--customer-ink)] hover:bg-[var(--customer-soft-hover)] hover:text-[var(--customer-ink)]" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" className="bg-[var(--customer-coral)] text-white hover:bg-[var(--customer-coral-dark)]">
              {address ? 'Update' : 'Add'} Address
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}

export { AddressForm }