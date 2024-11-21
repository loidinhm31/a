import {useState} from 'react'
import {Box} from '@mui/material'
import {UpdateNotice} from '../components/UpdateNotice'
import {ScrcpyPlusInfo} from '../components/ScrcpyPlusInfo'
import {Device} from '../components/Device'
import {Tools} from '../components/Tools'
import {Scrcpy} from '../components/Scrcpy'
import {Mirror} from '../components/Mirror'

export const Home = () => {
    const [deviceConnected, setDeviceConnected] = useState(false)
    const mirrorEngine = localStorage.getItem("set-mirror") === 'true'

    return (
        <Box sx={{scrollbarWidth: 'thin'}}>
            <UpdateNotice/>
            <ScrcpyPlusInfo/>
            <Device onDeviceChange={setDeviceConnected}/>

            {deviceConnected && <Tools/>}
            {deviceConnected && !mirrorEngine && <Scrcpy/>}
            {deviceConnected && mirrorEngine && <Mirror/>}
        </Box>
    )
}