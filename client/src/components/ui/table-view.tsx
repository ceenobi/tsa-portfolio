import {
	Table,
	TableBody,
	TableCell,
	TableHead,
	TableHeader,
	TableRow,
} from "./table";

type TableColumn = {
	uid: string;
	name: string;
};

type TableBodyProps<T> = {
	tableColumns: TableColumn[];
	tableData: T[];
	renderCell?: (item: T, columnKey: React.Key) => React.ReactNode;
};

export default function TableView<T extends { _id: string | number }>({
	tableColumns,
	tableData,
	renderCell,
}: TableBodyProps<T>) {
	return (
		<div className="overflow-x-auto">
			<Table className="table">
				<TableHeader className="bg-gray-200">
					<TableRow>
						<TableHead>#</TableHead>
						{tableColumns.map((item) => (
							<TableHead className="text-md font-semibold" key={item.uid}>
								{item.name}
							</TableHead>
						))}
					</TableRow>
				</TableHeader>
				<TableBody>
					{tableData.map((item, index) => (
						<TableRow
							key={item._id}
							className="hover:bg-gray-50 border-gray-300 bg-gray-100"
						>
							<TableCell>{index + 1}</TableCell>
							{tableColumns.map((col) => (
								<TableCell key={col.uid}>
									{renderCell ? renderCell(item, col.uid) : ""}
								</TableCell>
							))}
						</TableRow>
					))}
				</TableBody>
			</Table>
		</div>
	);
}
