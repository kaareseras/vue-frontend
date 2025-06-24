<template>
  <div class="map-container" style="position: relative;">
    <svg id="denmark-map" width="300" height="300"></svg>
    <!-- Tooltip container -->
    <div id="tooltip" class="tooltip" v-show="tooltip.visible" :style="{ top: tooltip.y + 'px', left: tooltip.x + 'px' }">
      {{ tooltip.text }}
    </div>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue'
import * as d3 from 'd3'

const emit = defineEmits(['region-selected'])

const selectedRegion = ref(null)
const tooltip = ref({
  visible: false,
  x: 0,
  y: 0,
  text: '',
})

onMounted(async () => {
  const width = 400
  const height = 250

  const svg = d3.select('#denmark-map')
    .attr('width', width)
    .attr('height', height)

  const projection = d3.geoMercator()
    .center([10.5, 56])
    .scale(2100)
    .translate([width / 2, height / 2])

  const path = d3.geoPath().projection(projection)

  const geojson = await d3.json('/denmark.geojson')

  svg.selectAll('path')
    .data(geojson.features)
    .enter()
    .append('path')
    .attr('d', path)
    .attr('fill', d => d.properties.regionGroup === 'DK1' ? '#42A5F5' : '#66BB6A')
    .attr('stroke', '#000')
    .attr('stroke-width', 1)
    .on('mouseover', (event, d) => {
      tooltip.value.visible = true
      tooltip.value.text = d.properties.regionGroup
    })
    .on('mousemove', (event) => {
      tooltip.value.x = event.offsetX + 10
      tooltip.value.y = event.offsetY + 10
    })
    .on('mouseout', () => {
      tooltip.value.visible = false
    })
    .on('click', (event, d) => {
      const region = d.properties.regionGroup
      selectedRegion.value = region
      emit('region-selected', region)
    })
})
</script>

<style scoped>
.map-container {
  text-align: center;
  position: relative;
}

.tooltip {
  position: absolute;
  background-color: rgba(0, 0, 0, 0.75);
  color: white;
  padding: 4px 8px;
  border-radius: 4px;
  pointer-events: none;
  font-size: 0.9rem;
  z-index: 10;
}
</style>
