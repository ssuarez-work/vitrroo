<template>
  <div class="pb-10">
    <header class="pt-14 pb-8 px-6 flex flex-col items-center text-center space-y-3">
      <Skeleton rounded="full" class="w-24 h-24" />
      <Skeleton class="h-7 w-48" />
      <Skeleton class="h-4 w-64" />
    </header>

    <nav class="px-5 mb-5">
      <div class="flex gap-2 overflow-hidden">
        <Skeleton v-for="i in 4" :key="i" rounded="full" class="h-10 w-24 flex-shrink-0" />
      </div>
    </nav>

    <main class="px-5">
      <div class="grid grid-cols-2 gap-3.5">
        <div v-for="i in 6" :key="i" class="card overflow-hidden flex flex-col">
          <Skeleton rounded="sm" class="aspect-square w-full" />
          <div class="p-3.5 space-y-2">
            <Skeleton class="h-4 w-3/4" />
            <Skeleton class="h-4 w-1/3" />
          </div>
        </div>
      </div>
    </main>
  </div>
</template>
