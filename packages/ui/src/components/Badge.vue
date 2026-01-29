<script setup lang="ts">
type BadgeVariant = 'new' | 'agent_assigned' | 'in_progress' | 'hold' | 'closed' | 'default'

interface Props {
  variant?: BadgeVariant
}

const props = withDefaults(defineProps<Props>(), {
  variant: 'default',
})

const variantClasses: Record<BadgeVariant, string> = {
  new: 'bg-blue-100 text-blue-800',
  agent_assigned: 'bg-purple-100 text-purple-800',
  in_progress: 'bg-yellow-100 text-yellow-800',
  hold: 'bg-orange-100 text-orange-800',
  closed: 'bg-green-100 text-green-800',
  default: 'bg-gray-100 text-gray-800',
}

const labels: Record<BadgeVariant, string> = {
  new: 'New',
  agent_assigned: 'Assigned',
  in_progress: 'In Progress',
  hold: 'On Hold',
  closed: 'Closed',
  default: '',
}
</script>

<template>
  <span
    :class="[
      'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium',
      variantClasses[props.variant],
    ]"
  >
    <slot>{{ labels[props.variant] }}</slot>
  </span>
</template>
