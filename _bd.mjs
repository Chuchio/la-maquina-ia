import puppeteer from 'puppeteer';
const b = await puppeteer.launch({headless:'new', args:['--use-gl=angle','--use-angle=swiftshader','--enable-webgl','--ignore-gpu-blocklist','--enable-unsafe-swiftshader']});
const p = await b.newPage();
await p.setViewport({width:800,height:800,deviceScaleFactor:2});
for(const v of ['dense','gyri','neural','wire','glow']){
  await p.goto('http://localhost:3000/brain-demo.html?solo='+v,{waitUntil:'load'});
  await new Promise(r=>setTimeout(r,2600));
  await p.screenshot({path:`./temporary screenshots/bd-${v}.png`});
}
await b.close(); console.log('done');
