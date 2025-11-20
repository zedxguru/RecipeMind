// src/utils/localFavs.js
export function getLocalFavs(){
  try {
    return JSON.parse(localStorage.getItem('rm_favs') || '[]');
  } catch(e){
    console.warn('localFavs parse err', e);
    return [];
  }
}

export function setLocalFavs(arr){
  try {
    localStorage.setItem('rm_favs', JSON.stringify(arr || []));
  } catch(e){
    console.warn('localFavs set err', e);
  }
}

export function toggleLocalFav(id){
  if(!id) return getLocalFavs();
  const arr = getLocalFavs();
  const idx = arr.indexOf(id);
  if(idx >= 0) { arr.splice(idx, 1); }
  else { arr.push(id); }
  setLocalFavs(arr);
  return arr;
}

export function isFav(id){
  if(!id) return false;
  return getLocalFavs().includes(id);
}
