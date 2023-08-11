import { CubeTextureLoader } from "three";

const loader = new CubeTextureLoader();
loader.setPath( './texture/MilkyWay/' );

export  const textureCube = await loader.loadAsync( [
	'dark-s_px.jpg', 'dark-s_nx.jpg',
	'dark-s_py.jpg', 'dark-s_ny.jpg',
	'dark-s_pz.jpg', 'dark-s_nz.jpg'
] );