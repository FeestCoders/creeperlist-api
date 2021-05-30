import { readFileSync } from 'fs';
import { serveridService } from '../services/serverid.service';

export const typeDefs = readFileSync(`${ __dirname }/serverid.api.graphql`, 'utf8');

export const resolvers = {

    Query: {

        serveridById: (obj, { id }, context, info) => {
            return serveridService.findById(id);
        },

        serverids: (obj, args, context, info) => {
            return serveridService.findAll();
        }
    },

    Mutation: {

        editserverid: (obj, { id, editserveridReq }, context, info) => {
            return serveridService.editserverid(id, editserveridReq);
        },

        deleteserverid: (obj, { id }, context, info) => {
            return serveridService.deleteserverid(id);
        }
    }
};
