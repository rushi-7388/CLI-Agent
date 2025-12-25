"use client"

import { Button } from "@/components/ui/button"
import { Spinner } from "@/components/ui/spinner"
import { authClient } from "@/lib/auth-client"
import { useRouter, useSearchParams } from "next/navigation"
import { useState } from "react"
import { CheckCircle, XCircle, Smartphone } from "lucide-react"
import { toast } from "sonner"


const DeviceApprovalPage = () => {
    const { data, isPending } = authClient.useSession()
    const router = useRouter()
    const searchParams = useSearchParams()
    const userCode = searchParams.get("user_code")

    const [isProcessing, setIsProcessing] = useState({
        approve: false,
        deny: false
    })

    if (isPending) {
        return (
            <div className="flex flex-col items-center justify-center h-screen gap-4 bg-background">
                <Spinner />
            </div>
        )
    }
    if (!data?.session && !data?.user) {
        router.push("/sign-in")
    }

    const handleApprove = async () => {
        setIsProcessing({
            approve: true,
            deny: false
        })

        try {
            toast.loading("Approving device...", { id: "Loading" })
            await authClient.device.approve({
                userCode:userCode!
            })
            toast.dismiss("Loading")
            toast.success("Device approved successfully!")
            router.push("/")
        } catch (error) {
            toast.error("Failed to approve device. Please try again.")
        }
        finally {
            setIsProcessing({
                approve: false,
                deny: false
            })
        }
     }

    const handleDeny = async () => {
        setIsProcessing({
            approve: false,
            deny: true
        })

        try {
            toast.loading("Denying device...", { id: "deny" })
            await authClient.device.deny({
                userCode:userCode!
            })
            toast.dismiss("Loading")
            toast.success("Device denied successfully!")
            router.push("/")
        } catch (error) {
            toast.error("Failed to deny device. Please try again.")
        }
        finally {
            setIsProcessing({
                approve: false,
                deny: false
            })
        }
     }

    return (
        <div className="flex min-h-screen items-center justify-center bg-background font-sans">
            <div className="w-full max-w-md px-4">
                <div className="space-y-8">

                    <div className="border-2 border-dashed border-zinc-700 rounded-2xl p-8 bg-zinc-900/50
                    backdrop-blur-sm text-center">
                        <div className="flex justify-center mb-6">
                            <div className="relative">
                                <div className="w-24 h-24 rounded-2xl border-2 border-dashed border-zinc-600 bg-zinc-800 flex items-center justify-center">
                                    <Smartphone className="w-12 h-12 text-cyan-400" />
                                </div>

                                <div className="absolute -top-2 -right-2 w-8 h-8 bg-orange-600 rounded-full border-2
                                border-zinc-900 flex items-center justify-center">
                                    <span className="text-xl text-white font-bold rounded-full animate-pulse" />
                                </div>
                            </div>
                        </div>

                        <div className="space-y-3">
                            <h1 className="text-3xl font-bold text-zinc-50">Device Authorization</h1>
                            <p className="text-xl text-zinc-400">A new device is attempting to access your account.</p>
                        </div>
                    </div>

                    <div className="border-2 border-dashed border-zinc-700 rounded-2xl p-6 bg-zinc-900/50
                    backdrop-blur-sm space-y-4">
                        <div className="space-y-2">
                            <p className="text-xl font-semibold text-zinc-500 uppercase tracking-wide">Authorization Code</p>
                            <div className="bg-zinc-800 rounded-lg p-4 border border-zinc-700">
                                <p className="text-xl font-mono font-bold text-cyan-500 text-center tracking-widest">{userCode || "---"}</p>
                            </div>
                            <p className="text-xl text-zinc-600 text-center">Share this Code with the device</p>
                        </div>
                    </div>

                    <div className="border-2 border-dashed border-zinc-700 rounded-2xl p-6 bg-zinc-900/50 backdrop-blur-sm">
                        <div className="space-y-3">
                            <p className="text-xl font-semibold text-zinc-500 uppercase tracking-wide">Account : {data?.user?.email}</p>
                            <div className="bg-zinc-800/50 rounded-lg p-4 border border-zinc-700">
                                <p className="text-xl text-zinc-400">
                                    Only approve this request if you initiated it. By approving, you allow this device to access your account.Never share your authorization code with anyone.
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-3">
                        <Button
                            onClick={handleApprove}
                            disabled={isProcessing.approve}
                            className="w-full h-11 bg-emerald-600 hover:bg-emerald-700 text-white font-semibold
                        rounded-lg transition-colors flex items-center justify-center gap-2">
                            {isProcessing.approve ? (
                                <>
                                    <Spinner className="w-4 h-4" />
                                    <span>Approving...</span>
                                </>
                            ) : (
                                <>
                                    <CheckCircle className="w-5 h-5" />
                                    <span>Approve Device</span>
                                </>
                            )}
                        </Button>

                        <Button onClick={handleDeny}
                            disabled={isProcessing.deny}
                            className="w-full h-11 bg-red-600 hover:bg-red-700 text-white font-semibold
                        rounded-lg transition-colors flex items-center justify-center gap-2">
                            {isProcessing.deny ? (
                                <>
                                    <Spinner className="w-4 h-4" />
                                    <span>Denying...</span>
                                </>
                            ) : (
                                <>
                                    <XCircle className="w-5 h-5" />
                                    <span>Deny Device</span>
                                </>
                            )}
                        </Button>
                    </div>

                    <div className="flex items-center gap-4">
                        <div className="flex-1 h-px border-t border-dashed border-zinc-700"></div>
                        <span className="text-xl text-zinc-600">Choose Wisely</span>
                        <div className="flex-1 h-px border-t border-dashed border-zinc-700"></div>
                    </div>
                </div>
            </div>
        </div>
    )
}


export default DeviceApprovalPage


// "use client"

// import { Button } from "@/components/ui/button"
// import { Spinner } from "@/components/ui/spinner"
// import { authClient } from "@/lib/auth-client"
// import { useRouter, useSearchParams } from "next/navigation"
// import { useState } from "react"
// import { CheckCircle, XCircle, Smartphone } from "lucide-react"
// import { motion } from "framer-motion"
// import { toast } from "sonner"

// const DeviceApprovalPage = () => {
//   const { data, isPending } = authClient.useSession()
//   const router = useRouter()
//   const searchParams = useSearchParams()
//   const userCode = searchParams.get("user_code")

//   const [isProcessing, setIsProcessing] = useState({
//     approve: false,
//     deny: false,
//   })

//   if (isPending) {
//     return (
//       <div className="flex h-screen items-center justify-center bg-black">
//         <Spinner />
//       </div>
//     )
//   }

//   if (!data?.session && !data?.user) {
//     router.push("/sign-in")
//   }

//   const handleApprove = async () => {
//     setIsProcessing({
//         approve:true,
//         deny: false
//     })

//     try {
//         toast.loading("Approving device..." , {id:"Loading"})
//         await authClient.device.approve({
//             userCode:userCode!
//         })
//         toast.dismiss("Loading")
//         toast.success("Device approved successfully!")
//         router.push("/")
//     } catch (error) {
//         toast.error("Failed to approve device. Please try again.")
//     }
//     finally{
//         setIsProcessing({
//             approve:false,
//             deny: false
//         })
//     }
//   }

//   const handleDeny = async () => {
//     setIsProcessing({
//         approve:false,
//         deny: true
//     })
//     try {
//         toast.loading("Denying device..." , {id:"Deny"})
//         await authClient.device.deny({
//             userCode:userCode!
//         })
//         toast.dismiss("Deny")
//         toast.success("Device denied successfully!")
//         router.push("/")
//     } catch (error) {
//         toast.error("Failed to deny device. Please try again.")
//     }
//     setIsProcessing({
//         approve:false,
//         deny: false
//     })
//   }

//   return (
//     <motion.div
//       initial={{ opacity: 0, y: 40 }}
//       animate={{ opacity: 1, y: 0 }}
//       transition={{ duration: 0.45 }}
//       className="min-h-screen flex items-center justify-center
//       bg-gradient-to-br from-zinc-950 via-zinc-900 to-black px-4"
//     >
//       <div className="w-full max-w-md space-y-8">
//         {/* Device */}
//         <div className="rounded-2xl border border-zinc-700/60
//         bg-zinc-900/70 backdrop-blur-xl p-8 text-center shadow-xl">
//           <motion.div
//             animate={{ y: [0, -8, 0] }}
//             transition={{ repeat: Infinity, duration: 2.5 }}
//             className="mx-auto mb-6 w-24 h-24 rounded-2xl
//             border border-zinc-700 bg-zinc-950
//             flex items-center justify-center"
//           >
//             <Smartphone className="w-12 h-12 text-cyan-400" />
//           </motion.div>

//           <h1 className="text-3xl font-extrabold text-zinc-100">
//             Device Authorization
//           </h1>
//           <p className="text-zinc-400 mt-2">
//             A device is requesting access
//           </p>
//         </div>

//         {/* Code */}
//         <div className="rounded-2xl border border-zinc-700/60
//         bg-zinc-900/70 p-6 backdrop-blur-xl">
//           <p className="text-xs uppercase tracking-widest
//           text-zinc-500 mb-3 text-center">
//             Authorization Code
//           </p>

//           <div className="rounded-xl bg-zinc-950 border border-zinc-700 p-4">
//             <motion.p
//               initial={{ letterSpacing: "0.1em", opacity: 0 }}
//               animate={{ letterSpacing: "0.35em", opacity: 1 }}
//               transition={{ duration: 0.4 }}
//               className="text-center font-mono text-xl
//               text-cyan-400 font-bold"
//             >
//               {userCode || "---"}
//             </motion.p>
//           </div>
//         </div>

//         {/* Account */}
//         <div className="rounded-2xl border border-zinc-700/60
//         bg-zinc-900/70 p-6 backdrop-blur-xl space-y-3">
//           <p className="text-xs uppercase tracking-widest text-zinc-500">
//             Account
//           </p>
//           <p className="text-sm text-zinc-300 font-medium">
//             {data?.user?.email}
//           </p>
//           <p className="text-sm text-zinc-400">
//             Only approve if you initiated this request.
//           </p>
//         </div>

//         {/* Actions */}
//         <div className="space-y-3">
//           <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.96 }}>
//             <Button
//               onClick={handleApprove}
//               disabled={isProcessing.approve}
//               className="w-full h-11 rounded-xl
//               bg-gradient-to-r from-emerald-500 to-green-600
//               text-white font-semibold shadow-lg"
//             >
//               <CheckCircle className="w-5 h-5 mr-2" />
//               Approve Device
//             </Button>
//           </motion.div>

//           <motion.div whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.96 }}>
//             <Button
//               onClick={handleDeny}
//               disabled={isProcessing.deny}
//               className="w-full h-11 rounded-xl
//               bg-gradient-to-r from-red-500 to-rose-600
//               text-white font-semibold shadow-lg"
//             >
//               <XCircle className="w-5 h-5 mr-2" />
//               Deny Device
//             </Button>
//           </motion.div>
//         </div>
//       </div>
//     </motion.div>
//   )
// }

// export default DeviceApprovalPage
