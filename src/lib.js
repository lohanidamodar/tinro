export function formatPath(path,slash=false){
    path = path.slice(
        path.startsWith('/#') ? 2 : 0,
        path.endsWith('/*') ? -2 : undefined
    )
    if(!path.startsWith('/')) path = '/'+path;
    if(path==='/') path = '';
    if(slash && !path.endsWith('/')) path += '/';
    return path;
}

export function getPathData(pattern,path){
    pattern = formatPath(pattern,true);
    path = formatPath(path,true);

    const keys = [];
    let params = {};
    let exact = true;
    let rx = pattern
       .split('/')
       .map(s => s.startsWith(':') ? (keys.push(s.slice(1)),'([^\\/]+)') : s)
       .join('\\/');

    let match = path.match(new RegExp(`^${rx}$`));
    if(!match) {
        exact = false;
        match = path.match(new RegExp(`^${rx}`));
    }
    if(!match) return null;
    keys.forEach((key,i) => params[key] = match[i+1]);

    return {exact,params};
}

export function makeRedirectURL(path,parent_pattern,slug){
    if(slug === '') return path;
    if(slug[0] === '/') return slug;
    const getParts = url => url.split('/').filter(p=>p!=='');

    const pathParts = getParts(path);
    const patternParts = getParts(parent_pattern);

    return '/'+patternParts.map((_,i)=>pathParts[i]).join('/')+'/'+slug;
}

export function getAttr(node,attr,rm,def){
    const re = [attr,'data-'+attr].reduce( 
        (r,c) => {
            const a = node.getAttribute(c);
            if(rm) node.removeAttribute(c);
            return a === null ? r: a;
        },
    false );
    return !def && re === '' ? true : re ? re : def ? def : false;
}

export function parseQuery(str){
    const o= str.split('&')
      .map(p => p.split('='))
      .reduce((r,p) => {
          const name = p[0];
          if(!name) return r;
          let value = p.length > 1 ? p[p.length-1] : true;
          if(typeof value === 'string' && value.includes(',')) value = value.split(',');
          (r[name] === undefined) ? r[name]=[value] : r[name].push(value);
          return r;
      },{});
  
    return Object.entries(o).reduce((r,p)=>(r[p[0]]=p[1].length>1 ? p[1] : p[1][0],r),{});
}

export function err(text){
    throw new Error(text);
}