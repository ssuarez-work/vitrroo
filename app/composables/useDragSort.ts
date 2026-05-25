import type { Ref } from 'vue'

interface SortableItem {
  id: string
}

interface DragSortOptions<T extends SortableItem> {
  items: Ref<T[]>
  onReorder: (orderedIds: string[]) => void | Promise<void>
}

export const useDragSort = <T extends SortableItem>(options: DragSortOptions<T>) => {
  const draggingId = ref<string | null>(null)
  const overId = ref<string | null>(null)

  const persistCurrentOrder = () => options.onReorder(options.items.value.map((item) => item.id))

  const indexOf = (id: string) => options.items.value.findIndex((item) => item.id === id)

  const swap = (fromIndex: number, toIndex: number) => {
    if (fromIndex === toIndex) return
    if (fromIndex < 0 || toIndex < 0) return
    if (toIndex >= options.items.value.length) return

    const next = [...options.items.value]
    const [moved] = next.splice(fromIndex, 1)
    if (!moved) return
    next.splice(toIndex, 0, moved)
    options.items.value = next
  }

  const moveUp = async (id: string) => {
    const index = indexOf(id)
    if (index <= 0) return
    swap(index, index - 1)
    await persistCurrentOrder()
  }

  const moveDown = async (id: string) => {
    const index = indexOf(id)
    if (index < 0 || index >= options.items.value.length - 1) return
    swap(index, index + 1)
    await persistCurrentOrder()
  }

  const canMoveUp = (id: string) => indexOf(id) > 0
  const canMoveDown = (id: string) => {
    const index = indexOf(id)
    return index >= 0 && index < options.items.value.length - 1
  }

  const onDragStart = (event: DragEvent, id: string) => {
    draggingId.value = id
    if (event.dataTransfer) {
      event.dataTransfer.effectAllowed = 'move'
      event.dataTransfer.setData('text/plain', id)
    }
  }

  const onDragOver = (event: DragEvent, id: string) => {
    event.preventDefault()
    if (event.dataTransfer) event.dataTransfer.dropEffect = 'move'
    if (!draggingId.value || draggingId.value === id) return
    overId.value = id
    swap(indexOf(draggingId.value), indexOf(id))
  }

  const onDragLeave = () => {
    overId.value = null
  }

  const onDragEnd = async () => {
    const wasDragging = draggingId.value !== null
    draggingId.value = null
    overId.value = null
    if (wasDragging) await persistCurrentOrder()
  }

  return {
    draggingId,
    overId,
    onDragStart,
    onDragOver,
    onDragLeave,
    onDragEnd,
    moveUp,
    moveDown,
    canMoveUp,
    canMoveDown
  }
}
