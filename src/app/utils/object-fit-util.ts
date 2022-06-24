// https://stackoverflow.com/questions/37256745/object-fit-get-resulting-dimensions

interface SizeInfo {
  width?: number;
  height?: number;
  left?: number;
  right?: number;
}

function getRenderedSize(
  contains: boolean, 
  cWidth: number, cHeight: number, 
  width: number, height: number, 
  pos: number
) {
  let oRatio = width / height,
      cRatio = cWidth / cHeight;
      
  return function() {
    let res: SizeInfo = {};
    if (contains ? (oRatio > cRatio) : (oRatio < cRatio)) {
      res.width = cWidth;
      res.height = cWidth / oRatio;
    } else {
      res.width = cHeight * oRatio;
      res.height = cHeight;
    }      
    res.left = (cWidth - res.width)*(pos/100);
    res.right = res.width + res.left;
    return res;
  }.call({});
}

export function getImgSizeInfo(img: any) {
  let pos = window.getComputedStyle(img).getPropertyValue('object-position').split(' ');
  console.log(
    'getImgSizeInfo', 
    pos,
    img.width,
    img.height,
    img.naturalWidth,
    img.naturalHeight
  );

  return getRenderedSize(
    true,
    img.width,
    img.height,
    img.naturalWidth,
    img.naturalHeight,
    parseInt(pos[0])
  );
}
