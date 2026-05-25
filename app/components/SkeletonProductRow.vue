<template>
  <div class="p-3 md:p-5 flex items-center gap-3">
    <Skeleton rounded="xl" class="w-16 h-16 flex-shrink-0" />
    <div class="flex-1 min-w-0 space-y-2">
      <Skeleton class="h-4 w-3/4" />
      <Skeleton class="h-4 w-1/3" />
      <Skeleton class="h-3 w-2/3" />
    </div>
    <Skeleton rounded="lg" class="w-9 h-9 flex-shrink-0" />
  </div>
</template>
