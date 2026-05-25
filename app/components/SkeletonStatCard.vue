<template>
  <div class="bg-white p-4 md:p-6 rounded-2xl md:rounded-3xl shadow-sm border border-[#f0f0f2]">
    <div class="flex items-center gap-3 md:gap-4">
      <Skeleton rounded="xl" class="w-10 h-10 md:w-12 md:h-12 flex-shrink-0" />
      <div class="flex-1 space-y-2">
        <Skeleton class="h-3 w-20" />
        <Skeleton class="h-6 w-16" />
      </div>
    </div>
  </div>
</template>
