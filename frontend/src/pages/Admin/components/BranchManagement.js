import { useState } from 'react';
import {
    Box,
    Paper,
    Typography,
    Button,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    IconButton,
    Chip,
    Grid,
    Switch,
    FormControlLabel,
    Tabs,
    Tab,
} from '@mui/material';
import {
    Add as AddIcon,
    Edit as EditIcon,
    Delete as DeleteIcon,
} from '@mui/icons-material';

const TabPanel = ({ children, value, index }) => (
    <div hidden={value !== index} style={{ display: value === index ? 'block' : 'none' }}>
        {value === index && children}
    </div>
);

const BranchManagement = () => {
    const [open, setOpen] = useState(false);
    const [editingBranch, setEditingBranch] = useState(null);
    const [activeTab, setActiveTab] = useState(0);
    const [branches, setBranches] = useState([
        {
            id: 1,
            name: 'Downtown Branch',
            address: '123 Main St',
            phone: '(555) 123-4567',
            status: 'active',
            openingTime: '09:00',
            closingTime: '22:00',
            // Added branch-specific settings
            deliveryRadius: 10,
            minimumOrderAmount: 15,
            allowScheduledOrders: true,
            maxScheduleDays: 7,
            automaticOrderAssignment: true,
            customDeliveryAreas: [],
            maxConcurrentOrders: 20,
            preparationTimeMinutes: 30,
        },
    ]);

    const handleOpen = (branch = null) => {
        setEditingBranch(branch);
        setOpen(true);
        setActiveTab(0);
    };

    const handleClose = () => {
        setEditingBranch(null);
        setOpen(false);
    };

    const handleSubmit = (event) => {
        event.preventDefault();
        // TODO: Implement branch creation/editing logic
        handleClose();
    };

    return (
        <Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', mb: 3 }}>
                <Typography variant="h4">Branch Management</Typography>
                <Button
                    variant="contained"
                    startIcon={<AddIcon />}
                    onClick={() => handleOpen()}
                >
                    Add New Branch
                </Button>
            </Box>

            <TableContainer component={Paper}>
                <Table>
                    <TableHead>
                        <TableRow>
                            <TableCell>Name</TableCell>
                            <TableCell>Address</TableCell>
                            <TableCell>Phone</TableCell>
                            <TableCell>Status</TableCell>
                            <TableCell>Hours</TableCell>
                            <TableCell>Actions</TableCell>
                        </TableRow>
                    </TableHead>
                    <TableBody>
                        {branches.map((branch) => (
                            <TableRow key={branch.id}>
                                <TableCell>{branch.name}</TableCell>
                                <TableCell>{branch.address}</TableCell>
                                <TableCell>{branch.phone}</TableCell>
                                <TableCell>
                                    <Chip
                                        label={branch.status}
                                        color={branch.status === 'active' ? 'success' : 'default'}
                                        size="small"
                                    />
                                </TableCell>
                                <TableCell>{`${branch.openingTime} - ${branch.closingTime}`}</TableCell>
                                <TableCell>
                                    <IconButton
                                        size="small"
                                        onClick={() => handleOpen(branch)}
                                    >
                                        <EditIcon />
                                    </IconButton>
                                    <IconButton
                                        size="small"
                                        color="error"
                                    >
                                        <DeleteIcon />
                                    </IconButton>
                                </TableCell>
                            </TableRow>
                        ))}
                    </TableBody>
                </Table>
            </TableContainer>

            <Dialog 
                open={open} 
                onClose={handleClose} 
                maxWidth="md" 
                fullWidth
            >
                <DialogTitle>
                    {editingBranch ? 'Edit Branch' : 'Add New Branch'}
                </DialogTitle>
                <DialogContent>
                    <Box sx={{ borderBottom: 1, borderColor: 'divider', mb: 2 }}>
                        <Tabs value={activeTab} onChange={(e, v) => setActiveTab(v)}>
                            <Tab label="Basic Info" />
                            <Tab label="Delivery Settings" />
                            <Tab label="Order Settings" />
                        </Tabs>
                    </Box>

                    <Box component="form" onSubmit={handleSubmit}>
                        <TabPanel value={activeTab} index={0}>
                            <Grid container spacing={2}>
                                <Grid item xs={12}>
                                    <TextField
                                        fullWidth
                                        label="Branch Name"
                                        defaultValue={editingBranch?.name}
                                        required
                                    />
                                </Grid>
                                <Grid item xs={12}>
                                    <TextField
                                        fullWidth
                                        label="Address"
                                        defaultValue={editingBranch?.address}
                                        required
                                    />
                                </Grid>
                                <Grid item xs={12}>
                                    <TextField
                                        fullWidth
                                        label="Phone Number"
                                        defaultValue={editingBranch?.phone}
                                        required
                                    />
                                </Grid>
                                <Grid item xs={6}>
                                    <TextField
                                        label="Opening Time"
                                        type="time"
                                        defaultValue={editingBranch?.openingTime || '09:00'}
                                        InputLabelProps={{ shrink: true }}
                                        required
                                        fullWidth
                                    />
                                </Grid>
                                <Grid item xs={6}>
                                    <TextField
                                        label="Closing Time"
                                        type="time"
                                        defaultValue={editingBranch?.closingTime || '22:00'}
                                        InputLabelProps={{ shrink: true }}
                                        required
                                        fullWidth
                                    />
                                </Grid>
                            </Grid>
                        </TabPanel>

                        <TabPanel value={activeTab} index={1}>
                            <Grid container spacing={2}>
                                <Grid item xs={12} md={6}>
                                    <TextField
                                        fullWidth
                                        label="Delivery Radius (km)"
                                        type="number"
                                        defaultValue={editingBranch?.deliveryRadius || 10}
                                        inputProps={{ min: 1 }}
                                    />
                                </Grid>
                                <Grid item xs={12} md={6}>
                                    <TextField
                                        fullWidth
                                        label="Minimum Order Amount ($)"
                                        type="number"
                                        defaultValue={editingBranch?.minimumOrderAmount || 15}
                                        inputProps={{ min: 0 }}
                                    />
                                </Grid>
                                <Grid item xs={12} md={6}>
                                    <TextField
                                        fullWidth
                                        label="Maximum Concurrent Orders"
                                        type="number"
                                        defaultValue={editingBranch?.maxConcurrentOrders || 20}
                                        inputProps={{ min: 1 }}
                                    />
                                </Grid>
                                <Grid item xs={12} md={6}>
                                    <TextField
                                        fullWidth
                                        label="Preparation Time (minutes)"
                                        type="number"
                                        defaultValue={editingBranch?.preparationTimeMinutes || 30}
                                        inputProps={{ min: 5 }}
                                    />
                                </Grid>
                            </Grid>
                        </TabPanel>

                        <TabPanel value={activeTab} index={2}>
                            <Grid container spacing={2}>
                                <Grid item xs={12}>
                                    <FormControlLabel
                                        control={
                                            <Switch
                                                defaultChecked={editingBranch?.allowScheduledOrders}
                                            />
                                        }
                                        label="Allow Scheduled Orders"
                                    />
                                </Grid>
                                <Grid item xs={12} md={6}>
                                    <TextField
                                        fullWidth
                                        label="Maximum Schedule Days"
                                        type="number"
                                        defaultValue={editingBranch?.maxScheduleDays || 7}
                                        inputProps={{ min: 1, max: 30 }}
                                    />
                                </Grid>
                                <Grid item xs={12}>
                                    <FormControlLabel
                                        control={
                                            <Switch
                                                defaultChecked={editingBranch?.automaticOrderAssignment}
                                            />
                                        }
                                        label="Automatic Order Assignment"
                                    />
                                </Grid>
                            </Grid>
                        </TabPanel>
                    </Box>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleClose}>Cancel</Button>
                    <Button type="submit" variant="contained" onClick={handleSubmit}>
                        {editingBranch ? 'Save Changes' : 'Add Branch'}
                    </Button>
                </DialogActions>
            </Dialog>
        </Box>
    );
};

export default BranchManagement;