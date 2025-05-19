"use client"

import { useState } from "react"
import { Check, ChevronsUpDown } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Command, CommandEmpty, CommandGroup, CommandInput, CommandItem, CommandList } from "@/components/ui/command"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"

// Data contoh untuk toko
const stores = [
  {
    value: "all",
    label: "Semua Toko",
  },
  {
    value: "jakarta",
    label: "Toko Jakarta",
  },
  {
    value: "bandung",
    label: "Toko Bandung",
  },
  {
    value: "surabaya",
    label: "Toko Surabaya",
  },
  {
    value: "medan",
    label: "Toko Medan",
  },
  {
    value: "makassar",
    label: "Toko Makassar",
  },
]

export function StoreFilter({ onStoreChange }: { onStoreChange?: (value: string) => void }) {
  const [open, setOpen] = useState(false)
  const [value, setValue] = useState("all")

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button variant="outline" role="combobox" aria-expanded={open} className="w-[200px] justify-between">
          {value ? stores.find((store) => store.value === value)?.label : "Pilih Toko..."}
          <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-[200px] p-0">
        <Command>
          <CommandInput placeholder="Cari toko..." />
          <CommandList>
            <CommandEmpty>Toko tidak ditemukan.</CommandEmpty>
            <CommandGroup>
              {stores.map((store) => (
                <CommandItem
                  key={store.value}
                  value={store.value}
                  onSelect={(currentValue) => {
                    const newValue = currentValue === value ? "" : currentValue
                    setValue(newValue || "all")
                    setOpen(false)
                    if (onStoreChange) {
                      onStoreChange(newValue || "all")
                    }
                  }}
                >
                  <Check className={cn("mr-2 h-4 w-4", value === store.value ? "opacity-100" : "opacity-0")} />
                  {store.label}
                </CommandItem>
              ))}
            </CommandGroup>
          </CommandList>
        </Command>
      </PopoverContent>
    </Popover>
  )
}
