import type { NextApiRequest, NextApiResponse } from 'next';
import { connectToDatabase } from '@/service/mongo';
import { MongoTeam } from '@fastgpt/service/support/user/team/teamSchema';
import { MongoUser } from '@fastgpt/service/support/user/schema';
import { MongoTeamMember } from '@fastgpt/service/support/user/team/teamMemberSchema';
import { hashStr } from '@fastgpt/global/common/string/tools';
import { jsonRes } from '@fastgpt/service/common/response';

export default async function handler(req: NextApiRequest, res: NextApiResponse<any>) {
  try {
    const { usernamePrefix, num } = req.body;

    if (!usernamePrefix) {
      throw new Error('缺少参数');
    }

    await connectToDatabase();

    for (let i = 0; i < num; i++) {
      const numberStr1 = Math.floor(10000 + Math.random() * 90000).toString();
      const numberStr2 = Math.floor(10000 + Math.random() * 90000).toString();
      const userResponse = await MongoUser.create({
        username: usernamePrefix + numberStr1,
        password: hashStr(numberStr2),
        phone: numberStr2,
        avatar: '/icon/human.png'
      });
      const teamResponse = await MongoTeam.create({
        name: 'My Team',
        ownerId: userResponse._id,
        defaultPermission: 4,
        avatar: '/icon/logo.png',
        balance: 999900000
      });
      await MongoTeamMember.create({
        teamId: teamResponse._id,
        userId: userResponse._id,
        name: 'Owner',
        role: 'owner',
        status: 'active',
        defaultTeam: true
      });
    }

    jsonRes(res);
  } catch (err) {
    jsonRes(res, {
      code: 500,
      error: err
    });
  }
}
