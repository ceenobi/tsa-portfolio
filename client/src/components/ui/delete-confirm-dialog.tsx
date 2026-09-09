import { AlertDialog } from "@base-ui/react/alert-dialog";
import { Button } from "@/components/ui/button";

interface DeleteConfirmDialogProps {
	open: boolean;
	onOpenChange: (open: boolean) => void;
	projectName: string;
	onConfirm: () => void;
	isPending?: boolean;
}

export default function DeleteConfirmDialog({
	open,
	onOpenChange,
	projectName,
	onConfirm,
	isPending,
}: DeleteConfirmDialogProps) {
	return (
		<AlertDialog.Root open={open} onOpenChange={onOpenChange}>
			<AlertDialog.Portal>
				<AlertDialog.Backdrop className="fixed inset-0 z-50 bg-black/40" />
				<AlertDialog.Popup className="fixed top-1/2 left-1/2 z-50 w-[calc(100%-2rem)] max-w-md -translate-x-1/2 -translate-y-1/2 rounded-xl bg-background p-6 shadow-lg">
					<AlertDialog.Title className="text-lg font-semibold text-mainBlack">
						Delete Project
					</AlertDialog.Title>
					<AlertDialog.Description className="mt-2 text-sm text-mainGray">
						Are you sure you want to delete{" "}
						<span className="font-medium text-mainBlack">{projectName}</span>? This
						action cannot be undone.
					</AlertDialog.Description>
					<div className="mt-6 flex justify-end gap-3">
						<AlertDialog.Close render={<Button variant="outline" className="h-11 px-5" />}>
							Cancel
						</AlertDialog.Close>
						<Button
							variant="destructive"
							disabled={isPending}
							className="h-11 px-5"
							onClick={onConfirm}
						>
							{isPending ? "Deleting…" : "Delete"}
						</Button>
					</div>
				</AlertDialog.Popup>
			</AlertDialog.Portal>
		</AlertDialog.Root>
	);
}
