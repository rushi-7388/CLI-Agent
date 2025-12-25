"use client"

import { authClient } from "@/lib/auth-client"
import React, { use } from "react"
import { useRouter } from "next/navigation"
import { useState } from "react"

import { ShieldAlert } from "lucide-react"
 

const DeviceAuthorizationPage = () => {

    const [userCode, setUserCode] = useState("")
    const [error, setError] = useState<string | null>(null)
    const [isLoading, setIsLoading] = useState(false)
    const router = useRouter()

    
    const handleSubmit = async(e:React.FormEvent) => {
        e.preventDefault()
        setError(null)
        setIsLoading(true)

        try {
            const formattedCode = userCode.trim().replace(/-/g, "").toUpperCase()

            const response = await authClient.device({
                query:{user_code:formattedCode}
            })
            if(response.data){
                router.push(`/approve?user_code=${formattedCode}`)
            }
        } catch (error) {
            setError("Invalid Device Code. Please try again.")
        }
        finally{
            setIsLoading(false)
        }
    }


    const handleCodeChange = (e:React.ChangeEvent<HTMLInputElement>) => {
        let value = e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, "")
        if (value.length > 4) {
            value = value.slice(0,4) + "-" + value.slice(4,8)
        }
        setUserCode(value)
    }

    return (
        <div className="min-h-screen flex items-center justify-center bg-background px-4">
            <div className="w-full max-w-md">
                {/* Header Section */}
                <div className="flex flex-col items-center gap-4 mb-8">
                    <div className="p-3 rounded-lg border-2 border-dashed border-zinc-700">
                        <ShieldAlert className="w-8 h-8 text-yellow-300" />
                    </div>

                    <div className="text-center">
                        <h1 className="text-3xl font-bold text-foreground mb-2">
                            Device Authorization
                        </h1>
                        <p className="text-muted-foreground">
                            Enter your device code to continue
                        </p>
                    </div>
                </div>

                {/* Form Section */}
                <form onSubmit={handleSubmit}
                className="border-2 border-dashed border-zinc-700 rounded-xl p-8 bg-zinc-900 backdrop-blur-sm">
                    <div className="space-y-6">
                        <div>
                            <label htmlFor="code" className="block text-sm font-medium text-foreground mb-2">Device Code</label>
                            <input id="code" type="text" value={userCode} onChange={handleCodeChange}
                            placeholder="XXXX-XXXX" maxLength={9}
                            className="w-full px-4 py-3 bg-zinc-900 border-2 border-dashed border-zinc-700 rounded-xl
                            text-foreground placeholder-muted-foreground focus:outline-none focus:border-zinc-800
                            font-mono text-center text-lg tracking-widest" />
                            <p className="text-xs text-muted-foreground mt-2">Find this Code on the Device you want to Authorize.</p>
                        </div>

                        {error && (
                            <div className="p-3 rounded-lg bg-red-950 border-red-900 text-red-300 text-sm">{error}</div>
                        )}

                        <button type="submit" disabled={isLoading || userCode.length < 9}
                        className="w-full py-3 px-4 bg-zinc-100 text-zinc-950 font-semibold rounded-lg">{isLoading ? "Verifying..." : "Continue"}</button>

                        <div className="p-4 bg-zinc-900 border-2 border-dashed border-zinc-700 rounded-lg">
                            <p className="text-xs text-muted-foreground leading-relaxed">
                                By authorizing this device, you allow it to access your account and perform actions on your behalf. 
                                Ensure you trust the device before proceeding.
                            </p>
                        </div>
                    </div>
                </form>

            </div>
        </div>
    )
}

export default DeviceAuthorizationPage

// "use client"

// import { authClient } from "@/lib/auth-client"
// import React, { useState } from "react"
// import { useRouter } from "next/navigation"
// import { ShieldAlert } from "lucide-react"
// import { motion } from "framer-motion"

// const DeviceAuthorizationPage = () => {
//   const [userCode, setUserCode] = useState("")
//   const [error, setError] = useState<string | null>(null)
//   const [isLoading, setIsLoading] = useState(false)
//   const router = useRouter()

//   const handleSubmit = async (e: React.FormEvent) => {
//     e.preventDefault()
//     setError(null)
//     setIsLoading(true)

//     try {
//       const formattedCode = userCode.trim().replace(/-/g, "").toUpperCase()
//       const response = await authClient.device({
//         query: { user_code: formattedCode },
//       })

//       if (response.data) {
//         router.push(`/approve?user_code=${formattedCode}`)
//       }
//     } catch {
//       setError("Invalid Device Code. Please try again.")
//     } finally {
//       setIsLoading(false)
//     }
//   }

//   const handleCodeChange = (e: React.ChangeEvent<HTMLInputElement>) => {
//     let value = e.target.value.toUpperCase().replace(/[^A-Z0-9]/g, "")
//     if (value.length > 4) value = value.slice(0, 4) + "-" + value.slice(4, 8)
//     setUserCode(value)
//   }

//   return (
//     <motion.div
//       initial={{ opacity: 0, scale: 0.96 }}
//       animate={{ opacity: 1, scale: 1 }}
//       transition={{ duration: 0.45, ease: "easeOut" }}
//       className="min-h-screen flex items-center justify-center
//       bg-gradient-to-br from-zinc-950 via-zinc-900 to-black px-4"
//     >
//       <div className="w-full max-w-md">
//         {/* Header */}
//         <div className="flex flex-col items-center gap-6 mb-10">
//           <motion.div
//             initial={{ opacity: 0, y: -20 }}
//             animate={{ opacity: 1, y: 0 }}
//             transition={{ type: "spring", stiffness: 120 }}
//             className="p-4 rounded-2xl border border-zinc-700/60
//             bg-zinc-900/60 shadow-xl"
//           >
//             <motion.div
//               animate={{ y: [0, -6, 0] }}
//               transition={{ repeat: Infinity, duration: 2.4, ease: "easeInOut" }}
//             >
//               <ShieldAlert className="w-9 h-9 text-yellow-400 drop-shadow" />
//             </motion.div>
//           </motion.div>

//           <div className="text-center space-y-1">
//             <h1 className="text-3xl font-extrabold tracking-tight text-zinc-100">
//               Device Authorization
//             </h1>
//             <p className="text-sm text-zinc-400">
//               Enter the code shown on your device
//             </p>
//           </div>
//         </div>

//         {/* Form */}
//         <motion.form
//           onSubmit={handleSubmit}
//           initial={{ opacity: 0, y: 30 }}
//           animate={{ opacity: 1, y: 0 }}
//           transition={{ delay: 0.1 }}
//           className="rounded-2xl border border-zinc-700/60
//           bg-zinc-900/70 backdrop-blur-xl p-8 shadow-xl space-y-6"
//         >
//           <div>
//             <label className="block text-sm font-semibold text-zinc-300 mb-2">
//               Device Code
//             </label>

//             <motion.input
//               whileFocus={{ scale: 1.02 }}
//               transition={{ type: "spring", stiffness: 300 }}
//               type="text"
//               value={userCode}
//               onChange={handleCodeChange}
//               placeholder="XXXX-XXXX"
//               maxLength={9}
//               className="w-full rounded-xl border border-zinc-700 bg-zinc-950
//               px-4 py-3 font-mono text-lg tracking-[0.35em] text-center
//               text-zinc-100 placeholder:text-zinc-600
//               focus:outline-none focus:ring-2 focus:ring-cyan-500/40"
//             />

//             <p className="mt-2 text-xs text-zinc-500 text-center">
//               This code appears on the device you want to authorize
//             </p>
//           </div>

//           {error && (
//             <motion.div
//               initial={{ x: -10, opacity: 0 }}
//               animate={{ x: [0, -6, 6, -4, 4, 0], opacity: 1 }}
//               transition={{ duration: 0.4 }}
//               className="rounded-xl border border-red-900
//               bg-red-950/60 px-4 py-3 text-sm text-red-300"
//             >
//               {error}
//             </motion.div>
//           )}

//           <motion.button
//             type="submit"
//             disabled={isLoading || userCode.length < 9}
//             whileHover={{ scale: 1.03 }}
//             whileTap={{ scale: 0.96 }}
//             className="w-full rounded-xl bg-gradient-to-r
//             from-cyan-500 to-blue-600 py-3 font-semibold
//             text-zinc-950 shadow-lg
//             disabled:opacity-50 disabled:cursor-not-allowed"
//           >
//             {isLoading ? "Verifying..." : "Continue"}
//           </motion.button>

//           <div className="rounded-xl border border-zinc-700/60 bg-zinc-900/60 p-4">
//             <p className="text-xs leading-relaxed text-zinc-400">
//               Only approve devices you trust. This grants account access.
//             </p>
//           </div>
//         </motion.form>
//       </div>
//     </motion.div>
//   )
// }

// export default DeviceAuthorizationPage
