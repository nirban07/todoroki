const { app } = require('@azure/functions');
const { DefaultAzureCredential } = require('@azure/identity');
const { ResourceManagementClient } = require('@azure/arm-resources');

const subscriptionId = process.env.AZURE_SUBSCRIPTION_ID;

app.http('todoroki', {
  methods: ['POST'],
  authLevel: 'anonymous',
  handler: async (request, context) => {
    try {
      const body = await request.json();
      const resourceGroupName = body.resourceGroupName;
      const location = body.location;

      if (!resourceGroupName || !location) {
        return {
          status: 400,
          body: 'Missing resourceGroupName or location in request body.'
        };
      }

      const credential = new DefaultAzureCredential();
      const client = new ResourceManagementClient(credential, subscriptionId);

      const result = await client.resourceGroups.createOrUpdate(resourceGroupName, {
        location: location
      });

      return {
        status: 200,
        jsonBody: {
          message: `Resource group '${resourceGroupName}' created in '${location}'`,
          result
        }
      };

    } catch (error) {
      context.log('Error creating resource group:', error);
      return {
        status: 500,
        body: 'Failed to create resource group.'
      };
    }
  }
});
