<template>
  <div>
    <header class="mb-6 md:mb-8 flex flex-col sm:flex-row sm:items-end sm:justify-between gap-4">
      <div class="space-y-2">
        <Skeleton class="h-8 w-56" />
        <Skeleton class="h-4 w-72" />
      </div>
      <Skeleton rounded="xl" class="h-10 w-44" />
    </header>

    <section class="bg-white rounded-2xl md:rounded-3xl shadow-sm border border-[#f0f0f2] overflow-hidden mb-5">
      <div class="p-5 md:p-6 border-b border-[#f0f0f2] flex items-center justify-between gap-3">
        <Skeleton class="h-5 w-32" />
        <Skeleton rounded="lg" class="h-9 w-16" />
      </div>
      <div class="p-5 md:p-6 space-y-3">
        <div class="flex items-center gap-3 bg-gray-50 p-3 rounded-2xl border border-gray-100">
          <Skeleton rounded="xl" class="w-10 h-10 flex-shrink-0" />
          <div class="flex-1 space-y-2">
            <Skeleton class="h-3 w-20" />
            <Skeleton class="h-4 w-3/4" />
          </div>
        </div>
        <div class="grid grid-cols-2 gap-2">
          <Skeleton rounded="xl" class="h-12 w-full" />
          <Skeleton rounded="xl" class="h-12 w-full" />
        </div>
      </div>
    </section>

    <div class="grid grid-cols-2 md:grid-cols-3 gap-3 md:gap-6 mb-5 md:mb-6">
      <SkeletonStatCard />
      <SkeletonStatCard />
      <SkeletonStatCard class="col-span-2 md:col-span-1" />
    </div>

    <section class="bg-white rounded-2xl md:rounded-3xl shadow-sm border border-[#f0f0f2] p-5 md:p-6 space-y-4">
      <div class="flex items-center justify-between">
        <Skeleton class="h-5 w-40" />
        <Skeleton class="h-4 w-24" />
      </div>
      <Skeleton rounded="lg" class="h-24 w-full" />
      <Skeleton rounded="lg" class="h-24 w-full" />
    </section>
  </div>
</template>
