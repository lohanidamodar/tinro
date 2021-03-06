import {getContext} from 'svelte';
import {writable} from 'svelte/store';
import {getAttr,parseQuery,getPathData} from './lib';

export const router = routerStore();

export function active(node){
    const href = getAttr(node,'href'),
          exact = getAttr(node,'exact',true),
          cl = getAttr(node,'active-class',true,'active');
          
    return {destroy:router.subscribe(r => {
        const data = getPathData(href,r.path); 
        data && (data.exact && exact || !exact) ? node.classList.add(cl) : node.classList.remove(cl);
    })}
}

function routerStore(){
    let hsh = window.location.pathname === 'srcdoc';

    const go = (href,set) => {
        hsh ? window.location.hash=href : history.pushState({}, '', href);
        set(getLocation(hsh));
    }

    const {subscribe,set} = writable(getLocation(hsh), _ => {
        window.hashchange = window.onpopstate = _ => set(getLocation(hsh));
        const un = aClickListener(href=>go(href,set));
        return _ => {
            window.hashchange = window.onpopstate = null;
            un();
        }
    }); 

    return {
        subscribe,
        goto: href => go(href,set),
        params: getParams,
        useHashNavigation: s => set(getLocation(hsh = s===undefined ? true : s))
    }
}

function getLocation(hsh){
    return hsh ? getLocationFromHash() : {
        path: window.location.pathname,
        query: parseQuery(window.location.search.slice(1)),
        hash: window.location.hash.slice(1)
    }
}

function getLocationFromHash(){
    const match = String(window.location.hash.slice(1)||'/').match(/^([^?#]+)(?:\?([^#]+))?(?:\#(.+))?$/);  
    return {
      path: match[1] || '',
      query: parseQuery(match[2] || ''),
      hash: match[3] || '',
    };
 }

function aClickListener(go){
    const h = e => {
        const a = e.target.closest('a[href]');
        const i = a && getAttr(a,'tinro-ignore');
        if(!i && a && /^\/$|^\/\w/.test(a.getAttribute('href'))) {
            e.preventDefault();
            go(a.getAttribute('href'));
        }
    }

    addEventListener('click', h);
    return () => removeEventListener('click', h);
}

function getParams(){
    return getContext('_').params;
}