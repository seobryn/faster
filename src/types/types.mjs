/**
 * @typedef {{params:import('../utils/general-utils.mjs').Params, searchParams: URLSearchParams, body: any, path: string}} ExtraRequestParams
 * @typedef {{json: (data: any)=> void, send: (data: string,headers: {[key:string]: string})=> import('../faster.mjs').FasterResponse, status: (code: number)=> import('../faster.mjs').FasterResponse, responseTime: number }} ExtraResponseParams
 */
