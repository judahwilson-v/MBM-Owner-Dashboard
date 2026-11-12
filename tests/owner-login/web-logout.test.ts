import {it,expect,vi,beforeEach} from 'vitest';
import {createElement} from 'react';
import {renderToStaticMarkup} from 'react-dom/server';
import fs from 'node:fs';
const s=vi.hoisted(()=>({signOut:vi.fn(),create:vi.fn(),getAll:vi.fn(),set:vi.fn(),revalidate:vi.fn(),redirect:vi.fn()}));
vi.mock('@/utils/supabase/server',()=>({createClient:s.create}));
vi.mock('next/headers',()=>({cookies:async()=>({getAll:s.getAll,set:s.set})}));
vi.mock('next/cache',()=>({revalidatePath:s.revalidate}));
vi.mock('next/navigation',()=>({usePathname:()=> '/',redirect:s.redirect}));
vi.mock('@/components/ThemeToggle',()=>({ThemeToggle:()=>null}));
import {logout} from '@/app/login/actions';
import {AppLayout} from '@/components/AppLayout';
beforeEach(()=>{vi.clearAllMocks();s.signOut.mockResolvedValue({error:null});s.create.mockResolvedValue({auth:{signOut:s.signOut}});s.getAll.mockReturnValue([{name:'sb-slgkzhchczgvfhryejqu-auth-token'},{name:'sb-slgkzhchczgvfhryejqu-auth-token.0'},{name:'sb-slgkzhchczgvfhryejqu-auth-token.12'},{name:'other-preference'},{name:'sb-other-project-auth-token'},{name:'sb-slgkzhchczgvfhryejqu-auth-token-not-session'}]);s.redirect.mockImplementation(()=>{throw Error('REDIRECT_LOGIN')})});
it('rendered website caller binds the imported logout Server Action and has a named button, never a nonexistent URL',()=>{
 const source=fs.readFileSync('src/components/AppLayout.tsx','utf8');
 expect(source).toContain('import { logout } from "@/app/login/actions"');expect(source).toContain('<form action={logout}>');
 const html=renderToStaticMarkup(createElement(AppLayout,{isConnected:false,quarryName:'Synthetic Quarry',children:'Synthetic dashboard'}));
 expect(html).toContain('aria-label="Sign out"');expect(html).toContain('<form');expect(html).not.toContain('/login/actions/logout');
});
it('website logout revokes only local provider session, clears only own session cookies and redirects',async()=>{
 await expect(logout()).rejects.toThrow('REDIRECT_LOGIN');expect(s.signOut).toHaveBeenCalledWith({scope:'local'});expect(s.set.mock.calls.map(c=>c[0])).toEqual(['sb-slgkzhchczgvfhryejqu-auth-token','sb-slgkzhchczgvfhryejqu-auth-token.0','sb-slgkzhchczgvfhryejqu-auth-token.12'].map(name=>({name,value:'',path:'/',maxAge:0})));expect(s.revalidate).toHaveBeenCalledWith('/','layout');expect(s.redirect).toHaveBeenCalledWith('/login');
});
it('network rejection and provider error still remove browser session without global logout',async()=>{
 for(const failure of ['reject','provider']){s.set.mockClear();if(failure==='reject')s.signOut.mockRejectedValueOnce(Error('private network detail'));else s.signOut.mockResolvedValueOnce({error:{message:'private provider detail'}});await expect(logout()).rejects.toThrow('REDIRECT_LOGIN');expect(s.set).toHaveBeenCalledTimes(3)}
});
it('client creation failure also clears local browser session and redirects without leaking details',async()=>{
 s.create.mockRejectedValueOnce(Error('private initialization detail'));await expect(logout()).rejects.toThrow('REDIRECT_LOGIN');expect(s.set).toHaveBeenCalledTimes(3);expect(s.redirect).toHaveBeenCalledWith('/login');
});
