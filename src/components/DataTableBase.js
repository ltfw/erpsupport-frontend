import React from 'react';
import DataTable from 'react-data-table-component';
import Checkbox from '@mui/material/Checkbox';

import ArrowDownward from '@mui/icons-material/ArrowDownward';

const sortIcon = <ArrowDownward />;
const selectProps = { indeterminate: isIndeterminate => isIndeterminate };

function DataTableBase({ column, data, ...props }) {
	return (
		<DataTable
			pagination
			selectableRowsComponent={Checkbox}
			selectableRowsComponentProps={selectProps}
			sortIcon={sortIcon}
            columns={column} // Pass the received 'column' prop
            data={data}     // Pass the received 'data' prop
			{...props}
		/>
	);
}

export default DataTableBase;