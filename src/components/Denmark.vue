<template>
  <div class="map-container">
    <svg id="denmark-map" width="300" height="300" class=""></svg>
  </div>
</template>

<script setup>
import { ref, onMounted } from 'vue';
import * as d3 from 'd3';

const selectedRegion = ref(null);

onMounted(async () => {
  const width = 400;
  const height = 250;

  const svg = d3.select('#denmark-map')
    .attr('width', width)
    .attr('height', height);

  const projection = d3.geoMercator()
    .center([10.5, 56])
    .scale(2100)
    .translate([width / 2, height / 2]);

  const path = d3.geoPath().projection(projection);

  const geojson = await d3.json('/denmark.geojson');

  svg.selectAll('path')
    .data(geojson.features)
    .enter()
    .append('path')
    .attr('d', path)
    .attr('fill', d => d.properties.regionGroup === 'DK1' ? '#42A5F5' : '#66BB6A')
    .attr('stroke', '#000')
    .on('click', (event, d) => {
      selectedRegion.value = d.properties.regionGroup;
    });
});
</script>

<style>
.map-container {
  text-align: center;
}
</style>