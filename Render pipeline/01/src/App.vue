<template>
  <div id="three-canvas" ref="threeTarget"></div>
</template>
<script setup lang="ts">
import { onMounted, ref } from 'vue';
import { TEngine } from './class/TEngine';
import { Helperlist } from './class/THelper'
import { textureCube } from './scene/cubetexture';
import { Lightlist } from './class/TLights'
import { TLigui } from './class/TLigui';
import { Boxlist } from './class/TBox';
onMounted(() => {
  const threeTarget = document.getElementById('three-canvas')
  if (!threeTarget)
    throw new Error('there is no canvas!')
  const TE = new TEngine(threeTarget)
  TE.onResize(threeTarget)
  //添加辅助线
  TE.addObject(...Helperlist)
  const background = textureCube
  TE.scene.background = background

  TE.addObject(...Lightlist)

  let gui = new TLigui(TE.renderer);
  TE.addObject(...Boxlist)
  //  gui.destroy()
})
</script>
<style scoped>
#three-canvas {
  height: 100vh;
  width: 100vw;
}
</style>
