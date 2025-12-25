// "use client";

// import { Button } from "@/components/ui/button";
// import { Spinner } from "@/components/ui/spinner";
// import { authClient } from "@/lib/auth-client";
// import Image from "next/image";
// import { useRouter } from "next/navigation";

// export default function Home() {

//   const {data, isPending} = authClient.useSession();
//   const router = useRouter();


//   if(!data?.session && !data?.user){
//     router.push("/sign-in");
//   }

//   if(isPending){
//     return (
//       <div className="flex flex-col items-center justify-center h-screen">
//         <Spinner />
//       </div>
//     )
//   }

//   return (
//     <div className="flex min-h-screen items-center justify-center bg-background font-sans">
//       <div className="w-full max-w-md px-4">
//         <div className="space-y-8">

//           <div className="border-2 border-dashed border-zinc-700 rounded-2xl p-8 bg-zinc-900/50 backdrop-blur-sm">
          
//           <div className="flex justify-center mb-6">
//               <div className="relative">
//                 <img src={data?.user?.image || "/vercel.svg"}
//                 alt={data?.user?.name || "User Avatar"}
//                 width={120}
//                 height={120}
//                 className="rounded-full border-2 border-dashed border-zinc-600 object-cover" />

//                 <div className="absolute -bottom-2 -right-2 w-6 h-6 bg-emerald-500 rounded-full border-2 border-zinc-900"></div>
//               </div>
//               </div>

//               <div className="space-y-3 text-center">
//               <h1 className="text-3xl font-bold text-zinc-50 truncate">Welcome , {data?.user?.name || "User"}</h1>
//               <p className="text-sm text-zinc-400">Authenticated users</p>
//             </div>
//             <div>

//             <div className="border-2 border-dashed border-zinc-700 rounded-2xl p-6 bg-zinc-900/50 backdrop-blur-sm space-y-4">
//             <div className="space-y-2">
//               <p className="text-xs font-semibold text-zinc-500 uppercase tracking-wide"> Email Address</p>
//               <p className="text-lg text-zinc-100 font-medium break-all">{data?.user?.email}</p>
//             </div>
//             </div>

//             <Button onClick={() => authClient.signOut({
//               fetchOptions:{
//                 onError:(ctx) => console.log(ctx),
//                 onSuccess: () => router.push("/sign-in"),
//               },
//             })
//             } 
//             className="w-full bg-red-600 hover:bg-red-700 text-white font-semibold rounded-lg transition-colors">Sign Out 
//             </Button>

//             <div className="flex items-center gap-3">
//               <div className="flex-1 h-px border-t border-dashed border-zinc-700"></div>
//               <span className="text-xs text-zinc-600"> Session Active </span>
//               <div className="flex-1 h-px border-t border-dashed border-zinc-700"></div>
//             </div>

//           </div>

//           </div>

//         </div>
//       </div>
//     </div>
//   );
// }


"use client";

import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { authClient } from "@/lib/auth-client";
import { useRouter } from "next/navigation";

export default function Home() {
  const { data, isPending } = authClient.useSession();
  const router = useRouter();

  if (isPending) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <Spinner />
      </div>
    );
  }

  if (!data?.session && !data?.user) {
    router.push("/sign-in");
    return null;
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-zinc-950 via-zinc-900 to-black px-4">
      <div className="w-full max-w-md">
        <div className="rounded-3xl border-2 border-dashed border-zinc-700 bg-zinc-900/60 p-8 backdrop-blur-md shadow-xl space-y-8">

          {/* Avatar */}
          <div className="flex justify-center">
            <div className="relative">
              <img
                src={data?.user?.image || "/vercel.svg"}
                alt={data?.user?.name || "User Avatar"}
                width={120}
                height={120}
                className="h-28 w-28 rounded-full border-2 border-dashed border-zinc-600 object-cover"
              />
              <span className="absolute bottom-0 right-0 h-5 w-5 rounded-full bg-emerald-500 border-2 border-zinc-900" />
            </div>
          </div>

          {/* Welcome */}
          <div className="text-center space-y-2">
            <h1 className="text-3xl font-extrabold text-zinc-50 truncate">
              Welcome, {data?.user?.name || "User"}
            </h1>
            <p className="text-sm text-zinc-400">
              You are successfully authenticated
            </p>
          </div>

          {/* User Info */}
          <div className="rounded-2xl border-2 border-dashed border-zinc-700 bg-zinc-900/50 p-5 space-y-2">
            <p className="text-xs font-semibold uppercase tracking-wide text-zinc-500">
              Email Address
            </p>
            <p className="text-base font-medium text-zinc-100 break-all">
              {data?.user?.email}
            </p>
          </div>

          {/* Sign Out */}
          <Button
            onClick={() =>
              authClient.signOut({
                fetchOptions: {
                  onError: (ctx) => console.log(ctx),
                  onSuccess: () => router.push("/sign-in"),
                },
              })
            }
            className="w-full rounded-xl bg-red-600 py-5 text-base font-semibold text-white transition hover:bg-red-700"
          >
            Sign Out
          </Button>

          {/* Footer */}
          <div className="flex items-center gap-3">
            <div className="flex-1 border-t border-dashed border-zinc-700" />
            <span className="text-xs text-zinc-500">Session Active</span>
            <div className="flex-1 border-t border-dashed border-zinc-700" />
          </div>
        </div>
      </div>
    </div>
  );
}
