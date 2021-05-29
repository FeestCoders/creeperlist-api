import DataLoader from 'dataloader';
import { serverService } from '../services/serverid.service';

export class UserDataLoader extends DataLoader {

    constructor() {
        const batchLoader = serverIds => {
            return serverService
                .findByIds(serverIds)
                .then(
                    serverid => serverIds.map(
                        serverId => serverid.filter(serverid => server.id === serverId)[0]
                    )
                );
        };

        super(batchLoader);
    }

    static getInstance(context) {
        if (!context.serveridDataLoader) {
            context.serveridDataLoader = new ServeridDataLoader();
        }

        return context.serveridDataLoader;
    }

}
