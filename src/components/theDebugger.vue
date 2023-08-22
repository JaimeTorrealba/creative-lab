<script setup>
import { useTresContext } from '@tresjs/core'

const context = useTresContext()
console.log('jaime ~ context:', context.scene.value.children)
</script>
