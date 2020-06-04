# coding: utf-8

# 用户需要准备的文件：
# 1. 加氢之后的pdb文件
# 2. 使用Amber选择力场之后生成的top文件

# 该脚本主要是用于实现范德华能以及静电势能的计算
# 范德华能需要的参数主要有cn1,cn2,r_ij,最终的计算公式是cn1*r_ij^30-cn2*r_ij^6
# 静电势能需要的参数主要有q_i,q_j,r_ij,最终的计算公式：q_i*q_j/r_ij
import os
import numpy as np
import math
import mdtraj as md
import itertools

# 创建一个字典，用来存储蛋白质中的所有残基
protein = {}


def add(a, b):
    return a + b


# 创建一个原子类Atom
class Atom(object):
    # 定义属性
    def __init__(self, index, name, residue, chain, resNum, coordinate, charge, atomType, atomTypeIndex):
        self.index = index  # 原子索引
        self.name = name  # 原子名称
        self.residue = residue  # 所属残基名
        self.chain = chain  # 所属链
        self.resNum = resNum  # 所属残基编号
        self.coordinate = coordinate  # 原子坐标
        self.charge = charge  # 原子所带电荷
        self.atomType = atomType  # 原子类型
        self.atomTypeIndex = atomTypeIndex  # 原子类型索引


# 创建一个残基类Residue
class Residue(object):
    # 定义属性
    def __init__(self, resName, resNum, atom):
        self.resName = resName  # 残基名
        self.resNum = resNum  # 残基序号
        self.atom = atom  # 残基所包含的原子


# 读取PDB文件
# PDB文件中主要包含有残基对应的原子信息
# 整个蛋白质应该表示成如下的形式：
# {[resnum:[]]}
def readPdb(f):
    # 读取PDB文件之后获得能量文件名
    global fileName
    fileNamePre = os.path.basename(f.name).split('.')[0]
    fileName = fileNamePre + '_energy.csv'
    # 读取每一个包含原子的行，创建一个原子对象，然后和上一个原子对象的残基类型作对比
    # 如果残基类型一致，不做处理，如果不一致，则创建一个残基对象，将原子对象添加到残基对象上
    # 再将残基对象添加到全局对象protein中
    res_num = 0
    lines = f.readlines()
    j = 0
    for i in lines:
        i = i.decode('UTF-8')
        if (i.split()[0] == "TER"):
            break;
        if (i.split()[0] == "ATOM"):
            index = i.split()[1]
            name = i.split()[2]
            residue = i.split()[3]
            chain = i.split()[4]
            resNum = i.split()[5]
            coordinate = [float(i.split()[6]), float(i.split()[7]), float(i.split()[8])]
            atomType = i.split()[-1]
            charge = 0
            atomTypeIndex = 0
            atom = Atom(index, name, residue, chain, resNum, coordinate, charge, atomType, atomTypeIndex)
            if (atom.resNum != res_num):
                res_num = atom.resNum
                atoms = []
                resName = atom.residue
                resNum = atom.resNum
                residue = Residue(resName, resNum, atoms)
                # print(resNum)
                protein[int(resNum)] = residue
                atoms.append(atom)
            else:
                atoms.append(atom)


# 读取top文件
# top文件中主要包含有原子对应的力场参数信息
def readTop(f):
    global cn1, cn2, iac, ico, ntype
    # 创建cn1来存储LJ参数1
    # 创建cn2来存储LJ参数2
    ntype = 0
    cn1 = []
    cn2 = []
    iac = []
    ico = []
    charge = []
    # 找到cn1，赋值给cn1
    flag_acoff = False
    flag_bcoff = False
    flag_charge = False
    flag_iac = False
    flag_ico = False
    lines_cn1 = []
    lines_cn2 = []
    lines_charge = []
    lines_iac = []
    lines_ico = []
    lines = f.readlines()
    for index, i in enumerate(lines):
        i = i.decode('UTF-8')
        if (i.strip() == "%FLAG POINTERS"):
            line = list(lines)[index + 2]
            ntype = line.split()[1]
        if (i.strip() == "%FLAG LENNARD_JONES_ACOEF"):
            flag_acoff = True
            continue
        if (i.strip() == "%FLAG LENNARD_JONES_BCOEF"):
            flag_acoff = False
            flag_bcoff = True
            continue
        if (i.strip() == "%FLAG BONDS_INC_HYDROGEN"):
            flag_bcoff = False
        if (i.strip() == "%FLAG CHARGE"):
            flag_charge = True
            continue
        if (i.strip() == "%FLAG ATOMIC_NUMBER"):
            flag_charge = False

        if (i.strip() == "%FLAG ATOM_TYPE_INDEX"):
            flag_iac = True
            continue
        if (i.strip() == "%FLAG NUMBER_EXCLUDED_ATOMS"):
            flag_iac = False

        if (i.strip() == "%FLAG NONBONDED_PARM_INDEX"):
            flag_ico = True
            continue
        if (i.strip() == "%FLAG RESIDUE_LABEL"):
            flag_ico = False

        if flag_acoff:
            lines_cn1.append(i)
        if flag_bcoff:
            lines_cn2.append(i)
        if flag_charge:
            lines_charge.append(i)
        if flag_iac:
            lines_iac.append(i)
        if flag_ico:
            lines_ico.append(i)

    for i in lines_cn1[1:]:
        cn1.extend(i.split())
    for i in lines_cn2[1:]:
        cn2.extend(i.split())
    for i in lines_charge[1:]:
        charge.extend(i.split())
    for i in lines_iac[1:]:
        iac.extend(i.split())
    for i in lines_ico[1:]:
        ico.extend(i.split())

    # # 循环找到每一个原子
    k = 0
    # print(len(charge))
    for i in protein.values():
        for j in i.atom:
            j.charge = charge[k]
            k += 1


# 读取轨迹文件,最终返回一个数组，数组中包含有n组坐标，每一组为一帧
def readDcd(traj_filename, pdb_filename):
    t = md.load(traj_filename, top=pdb_filename)
    traj = []
    for frame in range(t.n_frames):
        protein1 = protein
        index = 0
        for i in protein1.values():
            for j in i.atom:
                j.coordinate = list(t.xyz[frame][index] * 10)
                index += 1
        traj.append(protein1)
    return traj


# 计算两个残基之间的范德华能
def calculateVDM(res_1, res_2):
    vdm = 0
    for index, i in enumerate(res_1.atom):
        for index2, j in enumerate(res_2.atom):
            dist2 = pow((i.coordinate[0] - j.coordinate[0]), 2) + pow((i.coordinate[1] - j.coordinate[1]), 2) + pow(
                (i.coordinate[2] - j.coordinate[2]), 2)
            dist = math.sqrt(dist2)
            iacj = int(ntype) * (int(iac[index + 1]) - 1)
            ic = ico[iacj + int(iac[index2 + 1])]
            vdm += float(cn1[int(ic)]) * 1 / pow(dist, 12) - float(cn2[int(ic)]) * 1 / pow(dist, 6)
    return round(vdm, 4)


# 计算两个残基之间的静电势能
def calculateELE(res_1, res_2):
    ele = 0
    for i in res_1.atom:
        for j in res_2.atom:
            dist2 = pow((i.coordinate[0] - j.coordinate[0]), 2) + pow((i.coordinate[1] - j.coordinate[1]), 2) + pow(
                (i.coordinate[2] - j.coordinate[2]), 2)
            dist = math.sqrt(dist2)
            ele += float(i.charge) * float(j.charge) / dist
    return round(ele, 4)


# 遍历所有残基，将计算得到的能量值填充到对应的数组中去
def fill(filename):
    # global vdms,eles,tots
    # # 创建一个二维数组，用来存储蛋白质中所有残基之间的范德华能
    # vdms = np.zeros((len(protein),len(protein)),dtype=float)
    # # 创建一个二维数组，用来存储蛋白质中所有残基之间的静电势能
    # eles = np.zeros((len(protein),len(protein)),dtype=float)
    # # 创建一个二维数组，用来存储蛋白质中所有残基之间的总能量
    # tots = np.zeros((len(protein),len(protein)),dtype=float)
    with open(filename, 'w') as f:
        f.write("RES_1".center(10) + "RES_2".center(10) + "VDM".center(15) + "ELE".center(15) + "TOT".center(15) + '\n')
        for i, res_1 in enumerate(protein.values()):
            for j, res_2 in enumerate(list(protein.values())[i + 2:]):
                f.write(res_1.resNum.center(10) + res_2.resNum.center(10) + str(calculateVDM(res_1, res_2)).center(
                    15) + str(calculateELE(res_1, res_2)).center(15) + str(
                    round((calculateVDM(res_1, res_2) + calculateELE(res_1, res_2)), 4)).center(15) + '\n')


# 该函数计算残基与残基之间的距离，以矩阵的形式进行存储
# 这样的话在绘制network3D的时候就可以直接使用该矩阵的结果
# 输入是pdb文件，输出是残基与残基之间的距离矩阵
# 正常情况下应该是对于上传的文件进行存储，现在先做测试，所以先将文件写死
def distance_matrix(pdb_file):
    # 首先导入该文件
    t = md.load(pdb_file)
    # group中存放你想要计算的残基编号，因为我想计算所有残基之间的距离，所以我的两个group相等
    # 都是全部的残基索引 t.n_residues 便是残基的总数
    group = []
    for i in range(t.n_residues):
        group.append(i)
    pairs = list(itertools.product(group, group))
    # 使用哪个md.compute_contacts便可以计算出所有指定残基之间的距离
    temp = md.compute_contacts(t, pairs)
    # 为了方便我们使用，我们使用geometry.squareform来将结果转换成矩阵的形式
    dm = md.geometry.squareform(temp[0], temp[1])
    #  这里第一位用0是因为我们目前只计算PDB，只有一帧，后面两位便是残基1和残基2
    return dm[0]


if __name__ == '__main__':
    # 读取PDB文件
    readPdb("aa.pdb")
    # 读取top文件
    readTop("a.prmtop")
    # 读取Dcd文件，得到所有帧
    traj = readDcd("a.inpcrd", "aa.pdb")
