export const InputCss = `
  bg-white font-kanit peer border-2 w-full h-full bg-transparent 
  text-black font-normal outline outline-0 focus:outline-0 
  disabled:bg-slate-50 disabled:border-0 transition-all 
  placeholder-shown:border placeholder-shown:border-black 
  placeholder-shown:border-t-black border focus:border-2 
  border-t-transparent focus:border-t-transparent text-sm 
  px-3 py-2.5 rounded-[7px] border-black focus:border-black
`;

export const labelCss = `
  font-kanit flex w-full h-full select-none pointer-events-none absolute 
  left-0 font-normal !overflow-visible truncate 
  peer-placeholder-shown:text-black leading-tight 
  peer-focus:leading-tight peer-disabled:text-transparent 
  peer-disabled:peer-placeholder-shown:text-black transition-all -top-1.5 
  peer-placeholder-shown:text-sm text-[11px] peer-focus:text-[11px] 
  before:content[' '] before:block before:box-border before:w-2.5 
  before:h-1.5 before:mt-[6.5px] before:mr-1 
  peer-placeholder-shown:before:border-transparent before:rounded-tl-md 
  before:border-t-2 peer-focus:before:border-t-2 before:border-l 
  peer-focus:before:border-l-2 before:pointer-events-none before:transition-all 
  peer-disabled:before:border-transparent 
  after:content[' '] after:block after:flex-grow after:box-border after:w-2.5 
  after:h-1.5 after:mt-[6.5px] after:ml-1 
  peer-placeholder-shown:after:border-transparent after:rounded-tr-md 
  after:border-t-2 peer-focus:after:border-t-2 after:border-r-2 
  peer-focus:after:border-r-2 after:pointer-events-none after:transition-all 
  peer-disabled:after:border-transparent peer-placeholder-shown:leading-[3.75] 
  text-black peer-focus:text-black 
  before:border-black peer-focus:before:!border-black 
  after:border-black peer-focus:before:!border-t-black 
  peer-focus:after:!border-t-black
`;

export const labelSelectCss = `
  flex w-full h-full select-none pointer-events-none absolute left-0 
  font-normal truncate leading-[1.1] transition-all -top-0.5 
  text-[11px] border border-black rounded-md 
  focus-within:border-black focus-within:border-2 
  text-black focus-within:text-black pl-3 pr-3 py-[4px]
`;
