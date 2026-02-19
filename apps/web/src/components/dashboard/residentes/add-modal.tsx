'use client'

import { useState, useEffect } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from '@/components/ui/dialog'
import { Plus, Loader2 } from 'lucide-react'
import { addResident, getUnitsForAdmin } from '@/actions/residents'
import { useToast } from '@/components/ui/use-toast'

interface AdminUnit {
    id: string
    unitNumber: string
    condominium: {
        name: string
    }
}

export function AddResidentModal() {
    const [open, setOpen] = useState(false)
    const [loading, setLoading] = useState(false)
    const [units, setUnits] = useState<AdminUnit[]>([])
    const { toast } = useToast()
    const router = useRouter()
    const [formData, setFormData] = useState({
        name: '',
        lastName: '',
        email: '',
        phone: '',
        unitId: '',
        isOwner: false,
    })

    useEffect(() => {
        if (open) {
            getUnitsForAdmin().then(setUnits)
        }
    }, [open])

    async function onSubmit(e: React.FormEvent) {
        e.preventDefault()
        setLoading(true)

        try {
            const result = await addResident(formData)

            if (result.success) {
                toast({
                    title: 'Residente registrado',
                    description: 'El residente ha sido vinculado exitosamente.',
                })
                setOpen(false)
                router.refresh()
            } else {
                toast({
                    title: 'Error',
                    description: result.error || 'Ocurrió un error al registrar al residente.',
                    variant: 'destructive',
                })
            }
        } catch {
            toast({
                title: 'Error',
                description: 'Error de conexión con el servidor.',
                variant: 'destructive',
            })
        } finally {
            setLoading(false)
        }
    }

    return (
        <Dialog open={open} onOpenChange={setOpen}>
            <DialogTrigger asChild>
                <Button>
                    <Plus className="mr-2 h-4 w-4" />
                    Registrar Residente
                </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-[425px]">
                <DialogHeader>
                    <DialogTitle>Registrar Residente</DialogTitle>
                    <DialogDescription>
                        Vincule a un nuevo residente con una unidad habitacional.
                    </DialogDescription>
                </DialogHeader>
                <form onSubmit={onSubmit} className="space-y-4 py-4">
                    <div className="grid grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label htmlFor="name">Nombre</Label>
                            <Input
                                id="name"
                                value={formData.name}
                                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <Label htmlFor="lastName">Apellidos</Label>
                            <Input
                                id="lastName"
                                value={formData.lastName}
                                onChange={(e) => setFormData(prev => ({ ...prev, lastName: e.target.value }))}
                            />
                        </div>
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="email">Email</Label>
                        <Input
                            id="email"
                            type="email"
                            value={formData.email}
                            onChange={(e) => setFormData(prev => ({ ...prev, email: e.target.value }))}
                            required
                        />
                    </div>
                    <div className="space-y-2">
                        <Label htmlFor="unitId">Unidad</Label>
                        <select
                            id="unitId"
                            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                            value={formData.unitId}
                            onChange={(e) => setFormData(prev => ({ ...prev, unitId: e.target.value }))}
                            required
                        >
                            <option value="">Selecciona una unidad...</option>
                            {units.map((unit) => (
                                <option key={unit.id} value={unit.id}>
                                    {unit.condominium.name} - #{unit.unitNumber}
                                </option>
                            ))}
                        </select>
                    </div>
                    <div className="flex items-center space-x-2 pt-2">
                        <input
                            id="isOwner"
                            type="checkbox"
                            className="h-4 w-4 rounded border-gray-300 text-primary focus:ring-primary"
                            checked={formData.isOwner}
                            onChange={(e) => setFormData(prev => ({ ...prev, isOwner: e.target.checked }))}
                        />
                        <Label htmlFor="isOwner" className="text-sm font-normal">
                            Es propietario de la unidad
                        </Label>
                    </div>
                    <DialogFooter>
                        <Button type="submit" disabled={loading} className="w-full">
                            {loading ? (
                                <>
                                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    Registrando...
                                </>
                            ) : (
                                'Vincular Residente'
                            )}
                        </Button>
                    </DialogFooter>
                </form>
            </DialogContent>
        </Dialog>
    )
}
