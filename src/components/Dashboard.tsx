@@ .. @@
   if (!profile) {
     return (
       <div className="min-h-screen bg-gradient-to-br from-background to-muted/30 flex items-center justify-center">
         <div className="text-center">
-          <p className="text-muted-foreground">Loading user profile...</p>
+          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
+          <p className="text-muted-foreground">Loading user profile...</p>
         </div>
       </div>
     );
   }